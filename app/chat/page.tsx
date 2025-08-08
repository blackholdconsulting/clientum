'use client'

import { useState, useRef, FormEvent } from 'react'

type Msg = { role: 'user' | 'ai', text: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const prompt = input.trim()
    if (!prompt || loading) return

    setMessages(m => [...m, { role: 'user', text: prompt }, { role: 'ai', text: '' }])
    setInput('')
    setLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
        cache: 'no-store',
      })

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => `${res.status}`)
        throw new Error(err)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let aiText = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        aiText += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'ai', text: aiText }
          return copy
        })
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: `Error: ${String(err?.message || err)}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="space-y-2 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-1 rounded-lg ${m.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-grow border rounded px-3 py-2"
          placeholder="Escribe tu mensaje…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
