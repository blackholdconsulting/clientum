'use client'

import React, { useState, useRef, useEffect, FormEvent } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // 1) Añade el mensaje del usuario al estado
    const userMsg: Msg = { role: 'user', content: input }
    setMsgs((all) => [...all, userMsg])
    setInput('')
    setLoading(true)

    // 2) Llama a tu API interna
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content }),
    })

    if (!res.ok) {
      console.error(await res.text())
      setLoading(false)
      return
    }

    // 3) Recibe la respuesta del asistente
    const { content } = await res.json()
    const assistantMsg: Msg = { role: 'assistant', content }
    setMsgs((all) => [...all, assistantMsg])

    setLoading(false)
  }

  // Cada vez que cambian `msgs`, hacemos scroll al final
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Chat IA de Clientum</h1>

      <div className="h-96 overflow-y-auto border rounded p-4 space-y-2 bg-white">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === 'user'
                ? 'text-right text-green-700'
                : 'text-left text-gray-800'
            }
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex space-x-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '…' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
