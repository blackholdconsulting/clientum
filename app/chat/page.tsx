'use client'

import { useState, useRef, useEffect } from 'react'
import SidebarLayout from '@/components/Layout'

type Msg = { from: 'me' | 'bot'; text: string }

export default function ChatPage() {
  const [history, setHistory] = useState<Msg[]>([
    { from: 'bot', text: '¡Hola! ¿En qué puedo ayudarte hoy?' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Siempre scrollea al último mensaje
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Añade tu mensaje
    setHistory(h => [...h, { from: 'me', text: input.trim() }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      })
      const { reply, error } = await res.json()
      setHistory(h => [
        ...h,
        { from: 'bot', text: reply ?? error ?? 'Sin respuesta' }
      ])
    } catch {
      setHistory(h => [
        ...h,
        { from: 'bot', text: 'Error al conectar con el servidor' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      {/* Fondo oscuro general */}
      <div className="flex flex-col h-full bg-gray-900">
        {/* Contenedor centrado y ancho máximo */}
        <div className="flex-1 flex justify-center px-4 py-6">
          <div className="flex flex-col w-full max-w-3xl bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700">
              <h1 className="text-xl font-semibold text-white">Chat IA de Clientum</h1>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                      msg.from === 'me'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Entrada fija abajo */}
            <form
              onSubmit={sendMessage}
              className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex space-x-3"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                placeholder="Escribe tu pregunta…"
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 disabled:opacity-50"
              >
                {loading ? '…' : 'Enviar'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
