// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    // 1) Llamada directa REST a OpenAI
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asesor legal y financiero experto en autónomos y PYMEs en España. Responde con rigor, cita normas cuando proceda y usa un tono profesional claro.'
          },
          { role: 'user', content: message }
        ]
      })
    })

    if (!apiRes.ok) {
      const errTxt = await apiRes.text()
      return NextResponse.json({ error: errTxt }, { status: apiRes.status })
    }

    const { choices } = await apiRes.json()
    const content = choices?.[0]?.message?.content || ''
    return NextResponse.json({ content })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
