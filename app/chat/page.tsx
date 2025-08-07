'use client'
import React, { useState, useEffect, useRef, FormEvent } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types/supabase' // ajusta la ruta si tu tipado está en otro sitio

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const supabase = createClientComponentClient<Database>()
  const [session, setSession] = useState<boolean|null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // 1) Comprobar sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session)
    })
  }, [])

  // 2) Auto-scroll al final
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // 3) Enviar mensaje y recibir stream
  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    // Añadir mensaje de usuario
    const usrMsg: ChatMessage = { role: 'user', content: input.trim() }
    setMessages(msgs => [...msgs, usrMsg])
    setInput('')

    // Llamada al API (stream)
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: usrMsg.content })
    })
    if (!res.ok) return

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let acc = ''
    const assistant: ChatMessage = { role: 'assistant', content: '' }
    setMessages(msgs => [...msgs, assistant])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      acc += decoder.decode(value)
      // Actualiza chunk a chunk
      setMessages(msgs => {
        const last = msgs[msgs.length - 1]
        return [...msgs.slice(0, -1), { ...last, content: acc }]
      })
    }
  }

  // 4) Render
  if (session === null) {
    return <div className="p-6 text-center">Cargando sesión…</div>
  }
  if (!session) {
    return <div className="p-6 text-red-600 text-center font-semibold">Inicia sesión para chatear.</div>
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <h1 className="text-2xl font-bold p-6">Chat IA de Clientum</h1>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 space-y-4"
        style={{ minHeight: 0 }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`p-4 rounded-lg ${m.role==='user'?'bg-green-50 self-end':'bg-indigo-50 self-start'} max-w-xl`}>
            <p className="whitespace-pre-wrap text-gray-800">{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex items-center p-6 bg-gray-100">
        <input
          type="text"
          disabled={!session}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={session ? 'Escribe tu pregunta…' : 'Inicia sesión para chatear'}
          className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
