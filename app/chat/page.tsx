'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types/supabase'

export default function ChatPage() {
  const supabase = createClientComponentClient<Database>()
  const [session, setSession] = useState<any>(null)

  // 1) Carga la sesión y escucha cambios
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  // 2) Estado de mensajes e input
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 3) Scroll automático abajo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4) Función de envío
  const handleSend = async () => {
    if (!input.trim() || !session || isSending) return
    const userText = input.trim()
    setMessages((m) => [...m, { role: 'user', content: userText }])
    setInput('')
    setIsSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      })
      if (!res.ok) throw new Error(await res.text())

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      // Lee el stream chunk a chunk
      while (reader) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        assistantText += chunk

        // Actualiza último mensaje assistant en pantalla
        setMessages((m) => {
          const last = m[m.length - 1]
          if (last?.role === 'assistant') {
            return [...m.slice(0, -1), { role: 'assistant', content: assistantText }]
          } else {
            return [...m, { role: 'assistant', content: assistantText }]
          }
        })
      }
    } catch (error) {
      console.error(error)
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ Error al chatear.' }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat IA de Clientum</h1>
      <div className="flex-1 overflow-auto mb-4 bg-white p-4 rounded shadow">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right mb-2' : 'text-left mb-2'}>
            <span
              className={`inline-block px-3 py-2 rounded ${
                m.role === 'user'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {!session && (
          <div className="text-center text-gray-500 mt-4">Inicia sesión para chatear</div>
        )}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-l"
          placeholder={session ? 'Escribe tu mensaje...' : 'Inicia sesión para chatear'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!session || isSending}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!session || isSending}
          className="px-4 py-2 bg-green-600 text-white rounded-r disabled:opacity-50"
        >
          {isSending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
