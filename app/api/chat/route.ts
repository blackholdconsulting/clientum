// app/api/chat/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { OpenAI } from 'openai'

export const runtime = 'edge'

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

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

  // 1) Guarda tu mensaje
  const { data: userMsg, error: err1 } = await supabase
    .from('chat_messages')
    .insert({ user_id: session.user.id, role: 'user', content: message })
    .select('*')
    .single()
  if (err1 || !userMsg) {
    return NextResponse.json({ error: 'No se pudo guardar tu mensaje' }, { status: 500 })
  }

  // 2) Llama a OpenAI en modo streaming
  const responseStream = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres el asistente de Clientum, profesional y amable.' },
      { role: 'user', content: message },
    ],
    stream: true,
  })

  // 3) Devuelve un ReadableStream al cliente y acumulamos la respuesta
  let assistantContent = ''
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream) {
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) {
          assistantContent += delta
          controller.enqueue(new TextEncoder().encode(delta))
        }
      }
      // 4) Guarda la respuesta completa
      await supabase.from('chat_messages').insert({
        user_id: session.user.id,
        role: 'assistant',
        content: assistantContent,
      })
      controller.close()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
