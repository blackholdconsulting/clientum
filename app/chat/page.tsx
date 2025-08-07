'use client'
import React, { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [ msgs, setMsgs ]     = useState<Msg[]>([])
  const [ input, setInput ]   = useState('')
  const [ loading, setLoading ] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // 1) apilar mensaje usuario
    setMsgs(all => [...all, { role: 'user', content: input }])
    setInput('')
    setLoading(true)

    // 2) llamar a nuestro endpoint
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ question: input })
    })
    if (!res.ok) {
      setMsgs(all => [...all, { role:'assistant', content: '❌ Error de red' }])
      setLoading(false)
      return
    }
    const { answer } = await res.json()

    // 3) apilar respuesta AI
    setMsgs(all => [...all, { role:'assistant', content: answer }])
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat IA de Clientum</h1>
      <div className="border rounded-lg h-96 overflow-y-auto p-4 bg-white">
        {msgs.map((m,i) => (
          <div key={i} className={m.role==='user'? 'text-right text-green-700':'text-left'}>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={scrollRef} />
        {loading && <p className="italic text-gray-500">Clientum IA está escribiendo…</p>}
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribe tu pregunta…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 rounded"
          disabled={loading}
        >Enviar</button>
      </form>
    </div>
  )
}
