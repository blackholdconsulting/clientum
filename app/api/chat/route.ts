// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export const runtime = 'edge'

// instancia del cliente de OpenAI
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  // 1) autenticación
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2) lee el mensaje del cuerpo
  const { message } = await req.json()

  // 3) lanza la petición streaming a OpenAI
  const stream = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content:
          'Eres un asesor financiero y legal para autónomos y PYMEs en España. Responde con claridad, profesionalidad y cita normativa cuando proceda.'
      },
      { role: 'user', content: message }
    ]
  })

  // 4) reenvía el stream al cliente
  return new Response(stream.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
