'use client'

import { useState, useEffect, useRef } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Msg {
  role: string
  content: string
}

export default function ChatPage() {
  const supabase = createPagesBrowserClient()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [history, setHistory] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Carga sesión + histórico al montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSession(null)
      } else {
        setSession(session)
        fetch('/api/chat')
          .then((res) => res.json())
          .then((d) => setHistory(d.history || []))
      }
    })
  }, [supabase])

  // Scroll al final cuando hay nuevo mensaje
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const send = async () => {
    if (!input.trim()) return
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    })
    if (res.ok) {
      const { message } = await res.json()
      setHistory((h) => [...h, { role: 'user', content: input }, { role: 'assistant', content: message }])
      setInput('')
    }
  }

  if (session === null) {
    return <div className="p-6 text-red-600">Inicia sesión para chatear.</div>
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-lg space-y-2">
        {history.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-800'}>
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={send} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Enviar
        </button>
      </div>
    </div>
  )
}
