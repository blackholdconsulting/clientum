'use client'
import React, { useState, useEffect, useRef, FormEvent } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Message = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // carga sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  // envía el mensaje y procesa el stream
  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user' as const, content: input }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setStreaming(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content })
    })
    if (!res.ok) {
      console.error(await res.text())
      setStreaming(false)
      return
    }

    // lee el stream
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let assistantMsg: Message = { role: 'assistant', content: '' }
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      assistantMsg.content += decoder.decode(value)
      setMessages((m) => [...m.slice(0, -1), assistantMsg])
    }
    setStreaming(false)
  }

  // scroll automático
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!session) return <p className="text-red-600">Inicia sesión para chatear.</p>

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Chat IA de Clientum</h1>
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={
                msg.role === 'user'
                  ? 'inline-block bg-green-100 p-2 rounded'
                  : 'inline-block bg-gray-100 p-2 rounded'
              }
            >
              {msg.content}
            </span>
          </div>
        ))}
        {streaming && <p className="italic">Escribiendo...</p>}
      </div>
      <form onSubmit={send} className="flex items-center">
        <input
          disabled={streaming}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          className="flex-1 border p-2 rounded mr-2"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
