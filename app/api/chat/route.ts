// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export const runtime = 'edge'

// inicializa OpenAI con tu clave (mantenla en .env.local)
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  // 1) Auth con Supabase
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Lee el mensaje del body
  const { message } = await req.json()

  // 3) Lanza la petición streaming a OpenAI
  const responseStream = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Eres un asesor financiero y legal para autónomos y PYMEs en España. Responde siempre con claridad, profesionalidad y, cuando sea pertinente, cita la normativa vigente.'
      },
      { role: 'user', content: message }
    ]
  })

  // 4) Forzamos el cast para que TS acepte el stream como ReadableStream
  //    y lo devolvemos al cliente manteniendo text/event-stream
  // @ts-ignore
  const body = responseStream.body as ReadableStream<Uint8Array>

  return new Response(body, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
