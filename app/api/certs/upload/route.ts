// app/api/certs/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/auth-helpers-nextjs'
import forge from 'node-forge'

export async function POST(req: Request) {
  // 1) autenticamos al usuario
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // 2) parsear multipart/form-data
  const form = await req.formData()
  const file = form.get('certfile') as Blob | null
  const pass = form.get('password') as string

  if (!file || !pass) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  // 3) convertir Blob a buffer
  const arrayBuffer = await file.arrayBuffer()
  const pkcs12Der = forge.util.createBuffer(new Uint8Array(arrayBuffer).toString('binary'))
  const p12Asn1 = forge.asn1.fromDer(pkcs12Der)
  let p12
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, pass)
  } catch (e: any) {
    return NextResponse.json({ error: 'Contraseña o fichero inválido' }, { status: 400 })
  }

  // 4) extraer clave y certificado
  const keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0]
  const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0]

  const privateKeyPem = forge.pki.privateKeyToPem(keyObj.key)
  const certPem       = forge.pki.certificateToPem(certObj.cert)

  // 5) guardar en Supabase Storage o tabla cifrada
  // — aquí lo subimos a Storage en bucket `certs/{user_id}/`
  const bucket = `certs`
  const userId = session.user.id
  // creamos carpeta virtual en supabase storage
  const keyName = `${userId}/private_key.pem`
  const certName = `${userId}/certificate.pem`

  const up1 = await supabase.storage
    .from(bucket)
    .upload(keyName, privateKeyPem, { upsert: true, contentType: 'application/x-pem-file' })

  const up2 = await supabase.storage
    .from(bucket)
    .upload(certName, certPem,    { upsert: true, contentType: 'application/x-pem-file' })

  if (up1.error || up2.error) {
    console.error(up1.error, up2.error)
    return NextResponse.json({ error: 'Error subiendo a Storage' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
