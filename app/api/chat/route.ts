// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export const runtime = 'edge'

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  // 1) Autenticación
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Leemos el mensaje
  const { message } = await req.json()

  // 3) Llamada streaming a OpenAI
  const response = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Eres un asesor legal y financiero experto en autónomos y PYMEs en España. Responde siempre con rigor, cita normas cuando proceda y habla con lenguaje claro y profesional.'
      },
      { role: 'user', content: message }
    ]
  })

  // 4) Forzamos el cast para pasar el body al Response
  // @ts-ignore
  const stream = response.body as ReadableStream<Uint8Array>

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
