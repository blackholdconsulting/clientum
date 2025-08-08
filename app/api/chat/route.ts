import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  // 1) Sesión Supabase
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Parsear JSON
  let payload: { message?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { message } = payload
  if (!message) {
    return NextResponse.json({ error: 'Missing "message"' }, { status: 400 })
  }

  // 3) Llamada a Together AI (con tu clave en env)
  const together = await fetch('https://api.together.ai/chat', {
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
  if (!together.ok || !together.body) {
    const txt = await together.text().catch(() => '')
    console.error('Together error:', together.status, txt)
    return NextResponse.json({ error: 'AI service error' }, { status: 502 })
  }

  // 4) Reenvía el stream SSE al cliente
  return new NextResponse(together.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
