// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai-edge'

// Esto fuerza que la función corra en el Edge Runtime
export const runtime = 'edge'

// inicializa el cliente de OpenAI (usa tu OPENAI_API_KEY en .env)
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  // 1) Autenticación
  const supabase = createServerComponentClient({ cookies: () => req.cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  // 2) Leer el mensaje enviado por el cliente
  const { message } = await req.json()

  // 3) Llamada a OpenAI (chat.completions)
  const response = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      { role: 'system', content: 'Eres Clientum AI, un asistente experto en normativa fiscal y legal para autónomos y PYMEs.' },
      { role: 'user',   content: message }
    ]
  })

  // 4) Devolver el stream directo a la página
  return new NextResponse(response.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
