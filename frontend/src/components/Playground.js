import React from "react";
import Sidebar from "./Sidebar";
import ChatBox from "./ChatBox";
import SamplingParams from "./SamplingParams";

export default function Playground() {
  return (
    <div className="flex h-screen bg-white text-gray-800">
      <Sidebar />
      <div className="flex-1 flex overflow-hidden">
        <ChatBox />
      </div>
      <SamplingParams />
    </div>
  )
}