import React from "react";
import InputRange from "./InputRange";

export default function SamplingParams({ isStreaming, setIsStreaming }) {
  return (
    <div className="w-64 border-l border-gray-200 p-4 flex flex-col gap-6 overflow-y-auto">
      <InputRange label="Temperature" paramName="temperature" defaultValue={1.0} min={0.1} max={1} step={0.1}/>
      <InputRange label="Top P" paramName="top_p" defaultValue={1.0} min={0.1} max={1} step={0.1}/>
      <InputRange label="Top K" paramName="top_k" defaultValue={50} min={1} max={100} step={1}/>
      <InputRange label="Maximum Output Tokens" paramName="max_new_tokens" defaultValue={512} min={50} max={2048} step={1}/>
      {/* Streaming Toggle */}
      <div className="flex items-center space-x-4">
        <h3 className="block text-sm font-light dark:text-zinc-500">Streaming</h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isStreaming}
            onChange={(e) => setIsStreaming(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
        </label>
        <span className="text-xs rounded-md bg-grey-200 bg-zinc-200 text-zinc-500 px-4 py-0.5">
          {isStreaming ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
};