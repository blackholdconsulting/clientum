// app/api/facturas/sign/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from '@supabase/auth-helpers-nextjs'
import { signXMLForUser } from '@/lib/xmlSigner'

export async function POST(request: Request) {
  // 1) Autenticar al usuario
  const { data: { session } } = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const userId = session.user.id

  // 2) Leer XML del body
  const { xml } = await request.json() as { xml: string }
  if (!xml) {
    return NextResponse.json({ error: 'No se ha enviado XML' }, { status: 400 })
  }

  // 3) Firmar
  try {
    const signedXml = await signXMLForUser(userId, xml)
    return NextResponse.json({ signedXml })
  } catch (err: any) {
    console.error('Error en sign route:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
