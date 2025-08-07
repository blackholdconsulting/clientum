// app/api/chat/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { OpenAI } from 'openai'

export const runtime = 'edge'

// Inicializa el cliente con tu API Key
const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(req: Request) {
  // 1) Inicializa Supabase en server
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  // 2) Guarda el mensaje del usuario
  const { data: [userMsg], error: err1 } = await supabase
    .from('chat_messages')
    .insert({
      user_id: session.user.id,
      role: 'user',
      content: message,
    })
    .select('*')

  if (err1 || !userMsg) {
    return NextResponse.json({ error: 'Error guardando tu mensaje.' }, { status: 500 })
  }

  // 3) Llamada streaming a OpenAI
  const response = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres el asistente de Clientum, profesional y amable.' },
      { role: 'user', content: message },
    ],
    stream: true,
  })

  // 4) Transmite al cliente y, al cerrar, almacena la respuesta
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      let assistantContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        controller.enqueue(value)
        assistantContent += new TextDecoder().decode(value)
      }

      // Guarda la respuesta del asistente
      await supabase
        .from('chat_messages')
        .insert({
          user_id: session.user.id,
          role: 'assistant',
          content: assistantContent,
        })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
