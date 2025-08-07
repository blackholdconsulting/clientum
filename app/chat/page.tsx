// app/chat/page.tsx
'use client'

import React, { useState, useEffect, FormEvent, useRef } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function ChatPage() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Carga histórico al montar
  useEffect(() => {
    if (!session) return
    supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMessages(data)
      })
  }, [session, supabase])

  // Hace scroll al final cada vez que cambian mensajes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Enviar mensaje
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !session) return
    setSending(true)

    // Llamada a nuestra API
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input.trim() })
    })

    // Añadimos el mensaje del usuario al estado inmediatamente
    setMessages((m) => [
      ...m,
      { id: Date.now(), role: 'user', content: input.trim(), created_at: new Date().toISOString() }
    ])
    setInput('')

    // Leemos el stream de respuesta y vamos concatenando
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let assistantText = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      assistantText += decoder.decode(value)
      // Actualizamos el último mensaje asistente en pantalla
      setMessages((m) => {
        const last = m[m.length - 1]
        if (last?.role === 'assistant') {
          return [...m.slice(0, -1), { ...last, content: assistantText }]
        } else {
          return [...m, { id: Date.now(), role: 'assistant', content: assistantText, created_at: new Date().toISOString() }]
        }
      })
    }

    setSending(false)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Chat IA de Clientum</h1>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          disabled={!session || sending}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={session ? 'Escribe tu mensaje…' : 'Inicia sesión para chatear'}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className={`px-4 py-2 rounded-lg text-white ${
            sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } transition`}
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
