import React, { useState, useEffect } from "react";


const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;


async function handleSendParam(paramName, value, label) {
  try {
    const samplingParam = {[paramName]: value};
    const response = await fetch(`http://${BACKEND_ENDPOINT}/set-sampling-param`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(samplingParam)
    });

    if(!response.ok) {
      throw new Error(`Failed to set ${label} parameter`);
    }
  } catch(error) {
    console.error(error.message);
  }
}

export default function InputRange({label, paramName, defaultValue, min, max, step}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSendParam(paramName, value, label);
    }, 5000); // Wait for 5 secs before sending the sampling parameter

    return () => clearTimeout(timeout);
  }, [paramName, value, label]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-light dark:text-zinc-500">{label}</label>
        <span className="text-xs rounded-md bg-grey-200 bg-zinc-200 text-zinc-500 px-4 py-0.5">{value}</span>
      </div>
      <input className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" type="range" min={min}
        max={max} step={step} value={value} onChange={(e) => setValue(parseFloat(e.target.value))}
      />
    </div>
  )
}