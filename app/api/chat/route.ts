// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai'

export const runtime = 'edge'

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies: req.cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { message } = await req.json()
  if (typeof message !== 'string') {
    return new Response('Bad Request', { status: 400 })
  }

  // 1) Guarda el mensaje usuario
  const { data: inserted, error: err1 } = await supabase
    .from('chat_messages')
    .insert({ user_id: session.user.id, role: 'user', content: message })
    .select()
    .limit(1)
    .single()
  if (err1 || !inserted) {
    console.error(err1)
    return new Response('DB Error', { status: 500 })
  }

  // 2) Recupera todo el historial reciente
  const { data: history, error: err2 } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })
    .limit(50)
  if (err2 || !history) {
    console.error(err2)
    return new Response('DB Error', { status: 500 })
  }

  // 3) Llama a OpenAI
  const chat = await ai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    stream: true
  })

  // 4) Retorna el stream al cliente y guarda la respuesta a posteriori
  return new Response(chat.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
