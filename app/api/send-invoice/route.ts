// app/api/send-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const factura = await req.json()

    // Aquí podrías hacer un fetch real a B2BRouter:
    // const res = await fetch('https://api.b2brouter.com/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(factura),
    // })
    // const data = await res.json()

    // Por ahora devolvemos un mock:
    await new Promise(r => setTimeout(r, 500)) // simula latencia
    const data = { success: true, message: 'Factura enviada correctamente (mock)' }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error inesperado' },
      { status: 500 }
    )
  }
}
