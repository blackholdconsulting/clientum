// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Ejecutar en Edge
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  // 1) Cliente Supabase para route handlers
  const supabase = createRouteHandlerClient({ cookies })

  // 2) Comprueba sesión
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3) Parsear body
  const { message }: { message: string } = await req.json()
  if (!message) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

  // 4) Llamada a Together AI (ejemplo)
  const togetherRes = await fetch('https://api.together.ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gptj3',
      prompt: message,
      stream: true,
    }),
  })

  if (!togetherRes.ok || !togetherRes.body) {
    return NextResponse.json({ error: 'AI service error' }, { status: 502 })
  }

  // 5) Reenvía el stream al cliente
  return new NextResponse(togetherRes.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
