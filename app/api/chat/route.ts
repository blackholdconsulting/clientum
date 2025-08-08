// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // Inicializa Supabase (para auth si lo necesitas más adelante)
  const supabase = createRouteHandlerClient({ cookies })

  let json: { prompt?: string }
  try {
    json = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const { prompt } = json
  if (!prompt) return new Response('Falta “prompt” en el body', { status: 400 })

  const apiKey = process.env.TOGETHER_API_KEY!
  const apiUrl = process.env.NEXT_PUBLIC_INFERENCE_API_URL!

  // Llamada al SSE de TogetherAI
  const togetherRes = await fetch(`${apiUrl}/v1/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 256, temperature: 0.7 }
    }),
  })

  if (!togetherRes.ok || !togetherRes.body) {
    const errText = await togetherRes.text()
    return new Response(`Error TogetherAI: ${errText}`, { status: togetherRes.status })
  }

  // Reenvía el stream directamente al cliente
  return new Response(togetherRes.body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
