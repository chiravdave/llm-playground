import React from "react";
import InputRange from "./InputRange";

export default function SamplingParams() {
  return (
    <div className="w-64 border-l border-gray-200 p-4 flex flex-col gap-6 overflow-y-auto">
      <InputRange label="Temperature" paramName="temperature" defaultValue={1.0} min={0.1} max={1} step={0.1}/>
      <InputRange label="Top P" paramName="top_p" defaultValue={1.0} min={0.1} max={1} step={0.1}/>
      <InputRange label="Top K" paramName="top_k" defaultValue={50} min={1} max={100} step={1}/>
      <InputRange label="Maximum Output Tokens" paramName="max_new_tokens" defaultValue={512} min={50} max={2048} step={1}/>
    </div>
  );
};