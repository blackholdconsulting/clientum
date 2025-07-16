// app/api/facturas/generar/route.ts
import { NextResponse } from 'next/server'
import { generarFacturaE, FacturaEData } from '@/lib/facturae'

export async function POST(request: Request) {
  const data: FacturaEData = await request.json()
  const { xml, valid } = generarFacturaE(data)
  if (!valid) {
    return NextResponse.json({ error: 'XML no válido contra XSD' }, { status: 400 })
  }
  return NextResponse.json({ xml })
}
