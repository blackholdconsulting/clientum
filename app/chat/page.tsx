"use client";

import { useState } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "¡Hola! 👋 Soy el asistente IA de Clientum, ¿en qué puedo ayudarte?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Eres un asistente experto en Clientum, responde profesionalmente." },
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
        const botMsg: Message = { from: "bot", text: data.content };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Error en chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-white rounded-lg shadow-md">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xl px-4 py-3 rounded-2xl shadow ${
              msg.from === "user"
                ? "ml-auto bg-indigo-600 text-white rounded-br-none"
                : "mr-auto bg-gray-200 text-gray-900 rounded-bl-none"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-gray-200 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-none shadow animate-pulse">
            Escribiendo...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          className="flex-1 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-5 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
