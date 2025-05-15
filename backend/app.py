from typing import Any, Dict
import logging
import time
import json

from contextlib import asynccontextmanager
from asyncio import sleep
from fastapi import FastAPI, Response, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from local_llm import ChatCompletionLLM
from parser import parse_args


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    args = app.extra["args"]
    app.state.local_llm = ChatCompletionLLM(args)
    app.extra.pop("args")
    yield
    app.state.local_llm.flush()


app = FastAPI(
    title="local-llm-playground",
    description="Interaction with Large Language Models (LLMs) locally.",
    version="1.0.0",
    lifespan=lifespan)


# Add CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StreamRequest(BaseModel):
    stream: bool

@app.post("/set-sampling-param")
async def set_sampling_param(sampling_param: Dict[str, Any]):
    """
    Sets the sampling parameters for the language model.

    ** Parameters **
    - `temperature`: Controls randomness (higher means more random).
    - `max_new_tokens`: Max no. of tokens to generate.
    - `top_p`: Controls diversity via nucleus sampling.
    - `top_k`: Limits the number of top-k tokens considered.
    """
    logger.info(f"Setting sampling param: {sampling_param}")
    app.state.local_llm.set_sampling_param(sampling_param)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/set-streaming")
async def set_streaming(stream_request: StreamRequest):
    """
    Sets streaming for the language model.

    ** Parameters **
    - `stream`: Boolean to set streaming. 
    """
    logger.info(f"Is streaming on?: {stream_request.stream}")
    app.state.local_llm.stream = stream_request.stream
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.websocket("/completions")
async def completions(websocket: WebSocket):
    """
    WebSocket to accept requests for single-turn conversation. In this the client sends a message, and the assistant 
    responds to it without taking any conversation history.
    """
    await websocket.accept()
    try:
        while True:
            msg = await websocket.receive_text()
            history = [{"role": "user", "content": msg}]
            if app.state.local_llm.stream:
                for resp_msg in app.state.local_llm.send_streaming_response(history):
                    await websocket.send_text(json.dumps({"message": resp_msg}))
                    # This is to give streaming effect visually.
                    await sleep(0.06)
                await websocket.send_text(json.dumps({"message": "<eos>"}))
            else:
                assistant_msg = app.state.local_llm.send_nonstream_response(history)
                await websocket.send_text(json.dumps({"message": assistant_msg}))
    except WebSocketDisconnect:
        logger.info("Socket disconnected")
    except Exception as e:
        logger.error(f"Error occured in application: {e}")
        await websocket.close(code=status.HTTP_500_INTERNAL_SERVER_ERROR, reason="Server Error")


@app.websocket("/chat")
async def chat(websocket: WebSocket):
    """
    WebSocket to accept requests for multi-turn conversation. In this client and assistant take turns to send and 
    respond. Ever time a client sends a message, assistant responds to it considering the entire conversation history.
    """
    await websocket.accept()
    try:
        history = list()
        while True:
            msg = await websocket.receive_text()
            history.append({"role": "user", "content": msg})
            assistant_msg = list()
            if app.state.local_llm.stream:
                for resp_msg in app.state.local_llm.send_streaming_response(history):
                   await websocket.send_text(json.dumps({"message": resp_msg}))
                   # This is to give streaming effect visually.
                   await sleep(0.06)
                   assistant_msg.append(resp_msg)
                await websocket.send_text(json.dumps({"message": "<eos>"}))
                history.append({"role": "assistant", "content": "".join(assistant_msg)})
            else:
                assistant_msg = app.state.local_llm.send_nonstream_response(history)
                await websocket.send_text(json.dumps({"message": assistant_msg}))
                history.append({"role": "assistant", "content": assistant_msg})

    except WebSocketDisconnect:
        logger.info("Socket disconnected")
    except Exception as e:
        logger.error(f"Error occured in application: {e}")
        await websocket.close(code=status.HTTP_500_INTERNAL_SERVER_ERROR, reason="Server Error")



if __name__ == "__main__":
    args = parse_args()
    host, port = args.pop("host"), args.pop("port")
    app.extra["args"] = args
    uvicorn.run(app, host=host, port=port)