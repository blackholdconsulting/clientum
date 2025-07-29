"use client";

import { useState } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

export default function ChatPage() {  // 👈 Export default obligatorio
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "¡Hola! ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Eres un asistente de Clientum." },
            ...messages.map((msg) => ({
              role: msg.from === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: userInput },
          ],
        }),
      });

      const data = await res.json();
      if (data.content) {
        setMessages((prev) => [...prev, { from: "bot", text: data.content }]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-lg ${
              msg.from === "user"
                ? "bg-indigo-600 text-white self-end"
                : "bg-white text-gray-800 self-start shadow"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
