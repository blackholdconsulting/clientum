// app/api/chat/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Configuration, OpenAIApi } from 'openai'

export const runtime = 'edge'

// Configura OpenAI con tu API Key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Recupera todo el historial de este usuario
  const { data: history, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ history })
}

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { message } = await req.json()

  // 1) Guarda el mensaje del usuario
  await supabase
    .from('chat_messages')
    .insert({ user_id: session.user.id, role: 'user', content: message })

  // 2) Recupera el historial actualizado
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  // 3) Llama a OpenAI
  const aiResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: history!.map((m) => ({ role: m.role, content: m.content }))
  })
  const assistantContent = aiResponse.data.choices[0].message!.content!

  // 4) Guarda la respuesta del asistente
  await supabase
    .from('chat_messages')
    .insert({ user_id: session.user.id, role: 'assistant', content: assistantContent })

  return NextResponse.json({ message: assistantContent })
}
