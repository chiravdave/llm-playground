import React, {useEffect } from "react";


const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;


async function handleSendGenerationParam(paramName, value, label) {
  try {
    const response = await fetch(`http://${BACKEND_ENDPOINT}/set-generation-param`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({[paramName]: value})
    });

    if(!response.ok) {
      throw new Error(`Failed to set ${label} parameter`);
    }
  } catch(error) {
    console.error(error.message);
  }
}

export default function ToggleButton({label, paramName, value, onChange}) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSendGenerationParam(paramName, value, label);
    }, 3000); // Wait for 3 secs before sending the generation parameter

    return () => clearTimeout(timeout);
  }, [paramName, value, label]);

  return (
    <div className="flex items-center space-x-4">
      <h3 className="block text-sm font-light dark:text-zinc-500">{label}</h3>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition duration-300"></div>
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
      </label>
      <span className="text-xs rounded-md bg-grey-200 bg-zinc-200 text-zinc-500 px-4 py-0.5">
        {value ? "On" : "Off"}
      </span>
    </div>
  )
}