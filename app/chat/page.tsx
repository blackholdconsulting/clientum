// app/chat/page.tsx
"use client"

import { Fragment, useState, useRef, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { FiSend, FiUser, FiCpu } from "react-icons/fi"
import classNames from "clsx"

export default function ChatPage() {
  const [messages, setMessages] = useState<
    { from: "user" | "bot"; text: string }[]
  >([{ from: "bot", text: "¡Hola! ¿En qué puedo ayudarte hoy?" }])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    setMessages((m) => [...m, { from: "user", text: input }])
    setInput("")
    // aquí iría la llamada real al API
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Procesando tu petición..." },
      ])
      // tras la respuesta:
      setTimeout(() => {
        setMessages((m) => [
          ...m.slice(0, -1),
          { from: "bot", text: "Aquí tienes la respuesta generada por la IA." },
        ])
      }, 800)
    }, 300)
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] bg-white rounded-lg shadow">
        {/* Header */}
        <header className="px-6 py-4 border-b flex items-center">
          <FiCpu className="text-2xl text-indigo-600 mr-2" />
          <h1 className="text-xl font-semibold">Chat IA de Clientum</h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-100">
          {messages.map((m, i) => (
            <div
              key={i}
              className={classNames(
                "max-w-[75%] p-3 rounded-lg",
                m.from === "user"
                  ? "bg-indigo-600 text-white self-end"
                  : "bg-white text-gray-800 self-start"
              )}
            >
              <div className="flex items-start space-x-2">
                {m.from === "bot" ? (
                  <FiCpu className="text-indigo-600 mt-1" />
                ) : (
                  <FiUser className="text-gray-500 mt-1" />
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <footer className="px-6 py-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <textarea
              rows={1}
              className="flex-1 resize-none px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-indigo-300"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition"
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        </footer>
      </div>
    </main>
  )
}
