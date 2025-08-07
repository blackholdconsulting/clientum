// app/api/chat/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { OpenAI } from 'openai'

export const runtime = 'edge'

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(req: Request) {
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

  // 1) Guarda el mensaje del usuario
  const { data: userMsg, error: err1 } = await supabase
    .from('chat_messages')
    .insert({
      user_id: session.user.id,
      role: 'user',
      content: message,
    })
    .select('*')
    .single()

  if (err1 || !userMsg) {
    return NextResponse.json({ error: 'Error guardando tu mensaje.' }, { status: 500 })
  }

  // 2) Llamada streaming a OpenAI
  const responseStream = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres el asistente de Clientum, profesional y amable.' },
      { role: 'user', content: message },
    ],
    stream: true,
  })

  // 3) Transmite el contenido en streaming al cliente y guarda la respuesta al final
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let assistantContent = ''

      // responseStream is an async iterable of ChatCompletionChunk
      for await (const chunk of responseStream) {
        const content = chunk.choices?.[0]?.delta?.content
        if (content) {
          assistantContent += content
          controller.enqueue(encoder.encode(content))
        }
      }

      // 4) Guarda la respuesta completa
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

