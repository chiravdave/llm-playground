import React, { useState, useRef, useEffect } from "react";
import MessageInput from "./MessageInput";

export default function ChatBox() {
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [waitForAssistant, setWaitForAssistant] = useState(false);
  const socketRef = useRef(null);

  // WebSocket setup
  const connectWebSocket = () => {
    socketRef.current = new WebSocket("ws://localhost:8000/completions");

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          throw new Error(data.error);
        } else if (data.message) {
          // Add assistant message to chat history
          setChatHistory(prev => [...prev, {role: "assistant", content: data.message}]);
          setWaitForAssistant(false);
        } else {
          throw new Error("Assistant response has no 'error' or 'message' field");
        }
      } catch (error) {
        console.error(error.message);
        setError(true);
        setErrorMsg(error.message);
        setWaitForAssistant(false);
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
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      if (attempts < maxRetries) {
        await trySending();
      } else {
        console.error("WebSocket failed after 3 attempts. Message cannot be sent.");
        setError(true);
        setErrorMsg("Connection to backend failed after 3 attempts. Please check if backend is running properly")
        setWaitForAssistant(false);
      }
    } else {
      // Socket is ready, send the message
      socketRef.current.send(message);
      }
    };

    await trySending();
  }

  async function handleSendMessage(message) {
    if (!message.trim()) return;
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, {role: "user", content: message}]);
    setError(false);
    setWaitForAssistant(true);
    sendMessageWithRetries(message);
  }

  // Initial websocket setup
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 flex items-center px-4">
        <h1 className="font-bold text-lg">Completions Playground</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {chatHistory.map((chat, index) => {
          const isUser = chat.role === "user";
          return (
            <div key={index} className={`mb-4 whitespace-pre-wrap 
              ${isUser ? 'ml-auto w-2/5 px-4 py-2 bg-gray-300 text-black rounded-lg' : 'mr-auto w-full text-black'} 
              opacity-0 animate-fadeIn transition-opacity duration-300 ease-out`} style={{ animationDelay: `${50}ms`}}>
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
          {waitForAssistant && (<div className="mb-4 mr-auto w-2/5 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            <span className="animate-pulse">Assistant is typing...</span>
          </div>
          )}
      </div>
      
      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} waitForAssistant={waitForAssistant}/>
    </div>
  )
}