import React from "react";
import { Bot } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
      <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center shadow-sm cursor-pointer">
        <Bot size={16} className="text-blue-600" />
      </div>
    </div>
  );
}
