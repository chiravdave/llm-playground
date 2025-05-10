from typing import Any, Dict
import logging
import time
import json

from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
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


@app.websocket("/completions")
async def completions(websocket: WebSocket):
    """
    WebSocket for completions from the language model. 
    The client sends a message, and the assistant responds with a completion.
    """
    await websocket.accept()
    try:
        while True:
            msg = await websocket.receive_text()
            assistant_msg = app.state.local_llm.process_completion(msg)
            response = {"message": assistant_msg}
            await websocket.send_text(json.dumps(response))
    except WebSocketDisconnect:
        logger.info("Socket disconnected")
    except Exception as e:
        logger.error(f"Error occured in chat application: {e}")
        await websocket.close(code=status.HTTP_500_INTERNAL_SERVER_ERROR, reason="Server Error")



if __name__ == "__main__":
    args = parse_args()
    host, port = args.pop("host"), args.pop("port")
    app.extra["args"] = args
    uvicorn.run(app, host=host, port=port)