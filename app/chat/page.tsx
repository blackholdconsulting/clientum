'use client'
import { useState } from 'react'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  // aquí iría tu lógica de streaming, estados de mensajes, etc.

  const sendMessage = async () => {
    if (!input.trim()) return
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || `Server returned ${res.status}`)
        return
      }
      // Aquí va tu lógica de lectura del stream:
      // const reader = res.body!.getReader()…
    } catch (e: any) {
      console.error(e)
      setError('Error de red')
    }
  }

  return (
    <div>
      {/* tu UI de mensajes */}
      {error && <div style={{ color: 'red' }}>❌ {error}</div>}

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Escribe tu pregunta…"
      />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  )
}
