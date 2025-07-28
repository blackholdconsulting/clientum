"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input) return;
    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <main className="p-6 bg-white rounded-md shadow max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Chat con nosotros</h1>
      <div className="border rounded h-60 p-4 mb-4 overflow-y-auto">
        {messages.length === 0 && <p className="text-gray-500">Sin mensajes</p>}
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-medium">Tú:</span> {m}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={send}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Enviar
        </button>
      </div>
    </main>
);
}
