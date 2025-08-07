'use client'

import React, { useState, useEffect, useRef, FormEvent } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from '@supabase/auth-helpers-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const supabase = createClientComponentClient()
  const session = useSession()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Carga inicial de mensajes del usuario
  useEffect(() => {
    if (!session) return

    ;(async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error al cargar mensajes:', error)
      } else if (data) {
        setMessages(
          data.map((row) => ({
            id: row.id,
            role: row.role as 'user' | 'assistant',
            content: row.content,
          }))
        )
      }
    })()
  }, [session])

  // Scroll automático al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session || !inputValue.trim()) return

    // 1) Añade el mensaje del usuario en local
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')

    // 2) Guarda el mensaje del usuario en Supabase
    await supabase.from('chat_messages').insert({
      user_id: session.user.id,
      role: 'user',
      content: userMsg.content,
    })

    // 3) Llama a tu API interna para obtener la respuesta IA
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content }),
    })
    const { reply } = await res.json()

    // 4) Añade la respuesta del asistente en local y la guarda
    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: reply,
    }
    setMessages((prev) => [...prev, assistantMsg])
    await supabase.from('chat_messages').insert({
      user_id: session.user.id,
      role: 'assistant',
      content: assistantMsg.content,
    })
  }

  if (!session) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-red-600">Inicia sesión para chatear.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat IA de Clientum</h1>
      <div
        ref={scrollRef}
        className="h-[60vh] overflow-y-auto border bg-white rounded p-4 mb-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 ${
              m.role === 'assistant' ? 'text-gray-700' : 'text-blue-600'
            }`}
          >
            <strong>
              {m.role === 'assistant' ? 'Asistente:' : 'Tú:'}
            </strong>{' '}
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe tu mensaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
