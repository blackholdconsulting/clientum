'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<any>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const areaRef = useRef<HTMLDivElement>(null)

  // 1) Carga sesión al montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [supabase])

  // 2) Recupera historial al iniciar sesión
  useEffect(() => {
    if (!session) return
    supabase
      .from('chat_messages')
      .select('role,content')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMsgs(data as Msg[])
      })
  }, [session, supabase])

  // 3) Enviar mensaje
  const send = async () => {
    if (!input.trim()) return
    const userMsg: Msg = { role: 'user', content: input }
    setMsgs((m) => [...m, userMsg])
    setInput('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMsg.content }),
    })
    if (!res.ok) return

    // 4) Leer SSE stream
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let assistantText = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      assistantText += decoder.decode(value)
      // Actualiza mensaje parcial
      setMsgs((m) => {
        const last = m[m.length - 1]
        if (last?.role === 'assistant') {
          return [...m.slice(0, -1), { ...last, content: assistantText }]
        }
        return [...m, { role: 'assistant', content: assistantText }]
      })
      // Scroll
      areaRef.current?.scrollTo({ top: 99999, behavior: 'smooth' })
    }

    // 5) Guardar respuesta final
    await supabase.from('chat_messages').insert({
      user_id: session.user.id,
      role: 'assistant',
      content: assistantText
    })
  }

  if (!session) {
    return <p className="text-red-600 text-center mt-8">Inicia sesión para chatear.</p>
  }

  return (
    <div className="h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4">Chat IA de Clientum</h1>
      <div ref={areaRef} className="flex-1 overflow-y-auto bg-white p-4 rounded shadow space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <span
              className={
                (m.role === 'user'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800') +
                ' inline-block p-2 rounded'
              }
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe tu pregunta..."
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
