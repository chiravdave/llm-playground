import React, { useState, useRef, useEffect } from "react";
import MessageInput from "./MessageInput";


const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;


export default function ChatPlayground({ isStreaming }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [waitForAssistant, setWaitForAssistant] = useState(false);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isStreamingRef = useRef(isStreaming);

  // WebSocket setup.
  const connectWebSocket = () => {
    socketRef.current = new WebSocket(`ws://${BACKEND_ENDPOINT}/completions`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      setIsAssistantThinking(false);
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
              setChatHistory((prev) => {
                const last = prev[prev.length - 1];
                // If last message is assistant, append token.
                if (last && last.role === "assistant") {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.message
                  }
                  return updated;
                } else {
                  // First token so we will add new assistant message.
                  return [...prev, { role: "assistant", content: data.message }];
                }
            });}
          } else {
            // Adding assistant message to chat history.
            setChatHistory(prev => [...prev, { role: "assistant", content: data.message }]);
            setWaitForAssistant(false);
            isStreaming = isStreamingRef.current;
          }
        } else {
          throw new Error("Assistant response has no 'error' or 'message' field");
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

  // Keeping the isStreamingRef updated with latest value of isStreaming.
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

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

    setChatHistory(prev => [...prev, { role: "user", content: message }]);
    setError(false);
    setWaitForAssistant(true);
    setIsAssistantThinking(true);
    sendMessageWithRetries(message);
  }

  // Initial websocket setup.
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);



  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0">
        {chatHistory.map((chat, index) => {
          const isUser = chat.role === "user";
          return (
            <div key={index} className={`mb-4 whitespace-pre-wrap 
              ${isUser ? 'ml-auto w-2/5 px-4 py-2 bg-gray-300 text-black rounded-lg' : 'mr-auto w-full text-black'} 
              opacity-0 animate-fadeIn transition-opacity duration-300 ease-out`} style={{ animationDelay: `${50}ms` }}>
              {chat.content}
            </div>
          )})}
        {/* Error Message */}
        {error && (
          <div className="mb-4 mr-auto w-2/5 px-4 py-2 bg-red-100 text-red-800 border border-red-300 rounded-lg">
            {errorMsg}
          </div>
        )}
        {/* Assistant Typing Indicator */}
          {isAssistantThinking && (<div className="mb-4 mr-auto w-2/5 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            <span className="animate-pulse">Assistant is thinking...</span>
          </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} waitForAssistant={waitForAssistant} />
    </div>
  )
}
