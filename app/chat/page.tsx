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
    const userMsg: Msg = { role: 'user', content: input }
    setMsgs((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content })
    })
    if (!res.ok) {
      console.error(await res.text())
      setLoading(false)
      return
    }
    const { content } = await res.json()
    setMsgs((m) => [...m, { role: 'assistant', content }])
    setLoading(false)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Chat IA de Clientum</h1>
      <div className="h-96 overflow-y-auto border rounded p-4 space-y-2">
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
          className="flex-1 border rounded px-3"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 rounded"
          disabled={loading}
        >
          {loading ? '…' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
