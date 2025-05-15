import React, { useState, useRef, useEffect } from "react";
import MessageInput from "./MessageInput";


const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;


export default function CompletionsPlayground({ isStreaming }) {
  const [userMsg, setUserMsg] = useState("");
  const [assistantMsg, setAssistantMsg] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [waitForAssistant, setWaitForAssistant] = useState(false);
  const socketRef = useRef(null);
  const isStreamingRef = useRef(isStreaming);

  // WebSocket setup.
  const connectWebSocket = () => {
    socketRef.current = new WebSocket(`ws://${BACKEND_ENDPOINT}/completions`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          throw new Error(data.error);
        } else if (data.message) {
          if (isStreaming) {
            if (data.message === "<eos>") {
              setWaitForAssistant(false);
              isStreaming = isStreamingRef.current;
            } else {
              setAssistantMsg((prev) => prev + data.message);
            }
          } else {
            setAssistantMsg(data.message);
            setWaitForAssistant(false);
            isStreaming = isStreamingRef.current;
          }
        } else {
          throw new Error("Completion response has no 'error' or 'message' field");
        }
      } catch (error) {
        console.error(error.message);
        setError(true);
        setErrorMsg(error.message);
      }
    };

    socketRef.current.onerror = (error) => {
      const msg = `Error msg: ${error.message}`;
      console.error(msg);
      setError(true);
      setErrorMsg(msg);
      setWaitForAssistant(false);
    };

    socketRef.current.onclose = () => {
      const msg = "WebSocket connection closed";
      console.warn(msg);
      setError(true);
      setErrorMsg(msg);
      setWaitForAssistant(false);
    };
  };

  async function sendMessageWithRetries(message) {
    const maxRetries = 3;
    let attempts = 0;

    const trySending = async () => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        console.warn(`WebSocket not open (attempt ${attempts + 1}/${maxRetries}). Reconnecting...`);
        connectWebSocket();
        // Wait 1 second before retrying.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
        if (attempts < maxRetries) {
          await trySending();
        } else {
          console.error("WebSocket failed after 3 attempts. Message cannot be sent");
          setError(true);
          setErrorMsg("Connection to backend failed after 3 attempts. Please check if backend is running properly");
          setWaitForAssistant(false);
        }
      } else {
        // Socket is ready, send the message.
        socketRef.current.send(message);
      }
    };

    await trySending();
  }

  async function handleSendMessage(message) {
    if (!message.trim()) return;

    setUserMsg(message);
    setAssistantMsg("");
    setError(false);
    setWaitForAssistant(true);
    await sendMessageWithRetries(message);
  }

  // Initial websocket setup.
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Keeping the isStreamingRef updated with latest value of isStreaming.
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0">
          {/* User Message */}
          {userMsg !== "" && 
            <div className="mb-4 whitespace-pre-wrap ml-auto w-2/5 px-4 py-2 bg-gray-300 text-black rounded-lg opacity-0 \
            animate-fadeIn transition-opacity duration-300 ease-out" style={{ animationDelay: `${50}ms` }}>
              {userMsg}
            </div>
          }
          {/* Assistant Response */}
          { assistantMsg !== "" && 
            <div className="mb-4 whitespace-pre-wrap mr-auto w-full text-black opacity-0 animate-fadeIn transition-opacity \
            duration-300 ease-out" style={{ animationDelay: `${50}ms` }}>
              {assistantMsg}
            </div>
          }
        {/* Error Message */}
        {error && (
          <div className="mb-4 mr-auto w-2/5 px-4 py-2 bg-red-100 text-red-800 border border-red-300 rounded-lg">
            {errorMsg}
          </div>
        )}
        {/* Assistant Typing Indicator */}
          {userMsg !== "" && assistantMsg === "" && (<div className="mb-4 mr-auto w-2/5 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            <span className="animate-pulse">Assistant is thinking...</span>
          </div>
          )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} waitForAssistant={waitForAssistant} />
    </div>
  )
}
