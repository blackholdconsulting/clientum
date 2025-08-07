// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'edge'   // o coméntalo si quieres Node.js

// --- OPCIÓN A: con fetch puro ---
const HF_ENDPOINT = 'https://api-inference.huggingface.co/models/facebook/blenderbot_small'
const HF_TOKEN    = process.env.HUGGINGFACE_API_TOKEN!

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies: () => req.cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { question } = await req.json()

  // Llamada a HF
  const r = await fetch(HF_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ inputs: question, options: { wait_for_model: true } })
  })
  if (!r.ok) {
    console.error(await r.text())
    return new Response('Error en Hugging Face', { status: r.status })
  }
  const [ out ] = await r.json() as Array<{ generated_text: string }>
  return NextResponse.json({ answer: out.generated_text })
}
