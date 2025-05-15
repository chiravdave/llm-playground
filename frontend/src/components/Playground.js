import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatPlayground from "./ChatPlayground";
import CompletionsPlayground from "./CompletionsPlayground";
import SamplingParams from "./SamplingParams";


const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;


async function handleStreamingToggle(isStreaming) {
  try {
    const response = await fetch(`http://${BACKEND_ENDPOINT}/set-streaming`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({stream: isStreaming})
    });

    if(!response.ok) {
      throw new Error(`Failed to set streaming to ${isStreaming}`);
    }
  } catch(error) {
    console.error(error.message);
  }
}

export default function Playground() {
  const [isChatMode, setIsChatMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleStreamingToggle(isStreaming);
    }, 2000); // Wait for 2 secs before sending the sampling parameter

    return () => clearTimeout(timeout);
  }, [isStreaming]);

  return (
    <div className="flex h-screen bg-white text-gray-800">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
          <h1 className="font-bold text-lg">
            {isChatMode ? 'Chat Playground' : 'Completions Playground'}
          </h1>

          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Completion</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isChatMode}
                onChange={() => setIsChatMode(!isChatMode)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
            </label>
            <span className="text-sm text-gray-600">Chat</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {isChatMode ? <ChatPlayground isStreaming={isStreaming}/> : <CompletionsPlayground isStreaming={isStreaming}/>}
        </div>
      </div>

      <SamplingParams isStreaming={isStreaming} setIsStreaming={setIsStreaming}/>
    </div>
  )
}
