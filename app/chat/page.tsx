'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'

type Msg = { role: 'user' | 'ai'; text: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: '¡Hola! Soy Clientum AI. ¿En qué te ayudo hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => {
    const el = textareaRef.current; if (!el) return
    el.style.height = '0px'; el.style.height = Math.min(160, el.scrollHeight) + 'px'
  }, [input])

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    const prompt = input.trim()
    if (!prompt || loading) return

    setMessages(m => [...m, { role: 'user', text: prompt }, { role: 'ai', text: '' }])
    setInput(''); setLoading(true)

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
      if (!res.ok || !res.body) throw new Error(await res.text().catch(() => `${res.status}`))
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
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${String(err?.message || err)}` }])
    } finally { setLoading(false) }
  }

  const stop = () => { abortRef.current?.abort(); setLoading(false) }

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FA] text-slate-900 flex flex-col">
      {/* HEADER — sin “estilo Holded” ni “listo” */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">AI</div>
          <div className="flex-1">
            <div className="font-semibold">Clientum AI</div>
            <div className="text-xs text-slate-500">Asistente de BlackHold</div>
          </div>
          {/* Eliminado el badge de estado */}
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-4">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-2 sm:p-4">
            <ul className="space-y-4">
              {messages.map((m, i) => (
                <li key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'ai' && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-slate-100 border border-slate-200 grid place-items-center text-[11px] font-semibold text-slate-600">AI</div>
                  )}
                  <div className={m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl px-4 py-2 bg-indigo-600 text-white shadow-sm'
                      : 'max-w-[85%] rounded-2xl px-4 py-3 bg-slate-50 text-slate-800 border border-slate-200'}>
                    <pre className={`whitespace-pre-wrap leading-6 ${m.role === 'user' ? '' : 'prose-sm'}`}>
                      {m.text || (loading && i === messages.length - 1 ? '…' : '')}
                    </pre>
                  </div>
                  {m.role === 'user' && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 grid place-items-center text-[11px] font-semibold text-indigo-700">Tú</div>
                  )}
                </li>
              ))}
            </ul>
            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      {/* COMPOSER */}
      <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur">
        <form onSubmit={send} className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-3">
          <div className="rounded-full border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-200 px-3 py-2 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              className="min-h-[40px] max-h-40 flex-1 resize-none outline-none placeholder:text-slate-400 py-1"
              placeholder="Escribe tu mensaje…  (Shift+Enter para salto de línea)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
              }}
              disabled={loading && !input}
            />
            {loading ? (
              <button type="button" onClick={stop}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                title="Detener generación">
                Stop
              </button>
            ) : (
              <button type="submit"
                className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50"
                disabled={!input.trim()} title="Enviar">
                Enviar
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Consejito: pulsa <span className="font-semibold text-slate-500">Enter</span> para enviar y{' '}
            <span className="font-semibold text-slate-500">Shift+Enter</span> para nueva línea.
          </p>
        </form>
      </footer>
    </div>
  )
}
