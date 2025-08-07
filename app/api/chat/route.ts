import { NextRequest } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import OpenAI from 'openai-edge'

// Fuerza que la función corra en el Edge Runtime
export const runtime = 'edge'

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  // 1) Inicia Supabase en modo server
  const supabase = createServerComponentClient({ cookies: () => req.cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  // 2) Guarda el mensaje del usuario
  const { text } = await req.json()
  const { data: inserted, error: err1 } = await supabase
    .from('chat_messages')
    .insert({ user_id: session.user.id, role: 'user', content: text })
    .select()
  if (err1 || !inserted?.length) {
    console.error(err1)
    return new Response('Error inserting user message', { status: 500 })
  }
  const userMsg = inserted[0]

  // 3) Consulta el historial del chat para contexto
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role,content')
    .eq('user_id', session.user.id)
    .order('inserted_at', { ascending: true })

  // 4) Llama a OpenAI en streaming
  const response = await ai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      { role: 'system', content: 'Eres un asesor financiero y legal experto en PYMEs.' },
      ...(history || []).map((m) => ({ role: m.role, content: m.content }))
    ]
  })

  // 5) Guarda la respuesta del asistente en la base de datos
  const stream = response.body as ReadableStream
  const reader = stream.getReader()
  let assistantText = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    assistantText += new TextDecoder().decode(value)
  }
  await supabase.from('chat_messages').insert({
    user_id: session.user.id,
    role: 'assistant',
    content: assistantText
  })

  // 6) Reenvía el stream al cliente
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
