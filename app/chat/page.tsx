'use client'

import { useState, useRef, FormEvent } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user'|'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Añadimos mensaje de usuario
    setMessages(prev => [...prev, { role: 'user', text: input }])
    setInput('')

    // Cancelamos cualquier stream anterior
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Llamada al API
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
      signal: controller.signal,
    })

    if (!res.ok || !res.body) {
      const err = await res.text()
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err}` }])
      return
    }

    // Leemos el stream
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let aiText = ''

    // Añadimos placeholder para IA
    setMessages(prev => [...prev, { role: 'ai', text: '' }])

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      aiText += decoder.decode(value)
      // Actualizamos el último mensaje AI
      setMessages(prev => {
        const msgs = [...prev]
        msgs[msgs.length - 1].text = aiText
        return msgs
      })
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="space-y-2 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={`inline-block px-3 py-1 rounded-lg ${
                m.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-grow border rounded px-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje…"
        />
        <button type="submit" className="px-4 py-1 bg-blue-500 text-white rounded">
          Enviar
        </button>
      </form>
    </div>
  )
}
