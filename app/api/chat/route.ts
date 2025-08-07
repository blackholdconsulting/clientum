// app/api/chat/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai-edge'

export const runtime = 'edge'
const ai = new OpenAI()

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies })
  const { message } = await req.json()

  // 1) Guarda el mensaje del usuario
  const {
    data: [userMsg],
    error: err1
  } = await supabase
    .from('chat_messages')
    .insert({ user_id: (await supabase.auth.getSession()).data.session?.user.id, role: 'user', content: message })
    .select('*')

  if (err1 || !userMsg) {
    return NextResponse.json({ error: 'Error guardando tu mensaje.' }, { status: 500 })
  }

  // 2) Llamada a OpenAI
  const res = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres el asistente de Clientum, ayuda profesionalmente.' },
      { role: 'user', content: message }
    ],
    stream: true
  })

  // 3) A medida que llega el stream, lo vamos devolviendo al cliente…
  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      let assistantContent = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        controller.enqueue(value)
        assistantContent += new TextDecoder().decode(value)
      }

      // 4) Guarda la respuesta del asistente
      await supabase
        .from('chat_messages')
        .insert({ user_id: userMsg.user_id, role: 'assistant', content: assistantContent })
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
