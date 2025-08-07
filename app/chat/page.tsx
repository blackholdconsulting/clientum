'use client'
import React, { useState, useEffect, FormEvent, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types/supabase'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const supabase = createClientComponentClient<Database>()
  const [session, setSession] = useState<boolean>(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // carga sesión y mensajes previos
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setSession(true)
      supabase
        .from('chat_messages')
        .select('role,content')
        .eq('user_id', session.user.id)
        .order('inserted_at', { ascending: true })
        .then(({ data }) => {
          if (data) setMsgs(data as Msg[])
        })
    })
  }, [])

  // auto-scroll al fondo
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight })
  }, [msgs])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Msg = { role: 'user', content: input }
    setMsgs((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // llama al endpoint streaming
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ text: userMsg.content })
    })
    if (!res.ok) {
      setLoading(false)
      return
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let assistantMsg = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      assistantMsg += decoder.decode(value)
      setMsgs((prev) => {
        // actualiza el último mensaje de assistant
        const copy = [...prev]
        if (copy[copy.length - 1]?.role === 'assistant') {
          copy[copy.length - 1].content = assistantMsg
        } else {
          copy.push({ role: 'assistant', content: assistantMsg })
        }
        return copy
      })
    }

    setLoading(false)
  }

  if (!session) {
    return <p className="text-red-600">Inicia sesión para chatear.</p>
  }

  return (
    <div className="max-w-2xl mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">Chat IA de Clientum</h1>
      <div
        ref={boxRef}
        className="border h-96 p-4 overflow-y-auto bg-white rounded"
      >
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right text-green-600' : 'text-left'}>
            {m.content}
          </div>
        ))}
        {loading && <div className="italic text-gray-500">Pensando…</div>}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border rounded-l px-3 py-2 focus:outline-none"
          placeholder="Escribe tu pregunta..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 rounded-r hover:bg-green-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
