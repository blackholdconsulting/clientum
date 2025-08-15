// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
// Si vas a usar supabase más tarde:
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'         // Asegura streaming en Node
export const dynamic = 'force-dynamic'  // Sin caché

const BASE_URL = process.env.TOGETHER_BASE_URL ?? 'https://api.together.xyz'
const MODEL    = process.env.TOGETHER_MODEL ?? 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'

export async function POST(req: NextRequest) {
  // const supabase = createRouteHandlerClient({ cookies }) // opcional, si luego guardas historial
  let body: { prompt?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const prompt = (body.prompt ?? '').trim()
  if (!prompt) return new Response('Falta "prompt"', { status: 400 })

  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) return new Response('Falta TOGETHER_API_KEY', { status: 500 })

  // Llamada a Together: Chat Completions con stream SSE
  const upstream = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.7,
      max_tokens: 512,
      messages: [
        { role: 'system', content: 'Eres un asistente útil y conciso.' },
        { role: 'user',   content: prompt }
      ],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '')
    // Si ves HTML aquí, es que el endpoint es incorrecto
    return new Response(`Together API ${upstream.status}: ${text.slice(0, 1000)}`, {
      status: upstream.status || 502,
    })
  }

  // Transformamos el SSE de Together a texto plano (solo los tokens),
  // para que el front solo haga fetch y pinte en tiempo real.
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader()
      let buffer = ''

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const raw of lines) {
            const line = raw.trim()
            if (!line || !line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (data === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(data)
              const delta = json?.choices?.[0]?.delta?.content
              if (delta) controller.enqueue(encoder.encode(delta))
            } catch {
              // líneas keep-alive u otros eventos: ignorar
            }
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
        reader.releaseLock()
      }
    }
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // evita buffering en algunos proxies
    },
  })
}
