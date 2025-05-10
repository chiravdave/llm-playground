import React, { useRef } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSendMessage, waitForAssistant }) {
  // Create a ref to directly access the textarea value & button
  const textareaRef = useRef(null);
  const buttonRef = useRef(null);
  
  function handleSend() {
    // Get message from textarea
    const message = textareaRef.current.value.trim();
    if (message) {
      textareaRef.current.value = '';
      textareaRef.current.disabled = true;
      buttonRef.current.disabled = true;
      onSendMessage(message);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="relative">
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 pr-10 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref={textareaRef} onKeyDown={handleKeyDown} placeholder="Ask anything." disabled={waitForAssistant}
        />
        <button className="absolute right-3 bottom-1/2 transform translate-y-1/2 text-gray-500 hover:text-gray-700" 
          ref={buttonRef} onClick={handleSend} disabled={waitForAssistant}>
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}