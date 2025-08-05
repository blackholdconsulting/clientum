// app/api/profile/sign/route.ts
import { NextResponse } from 'next/server'
import forge from 'node-forge'

export const runtime = 'edge' // o 'nodejs', según tu despliegue

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const p12File = form.get('p12') as Blob
    const passphrase = form.get('pass') as string
    const payload  = form.get('payload') as string

    if (!p12File || !passphrase || !payload) {
      return NextResponse.json({ error: 'Faltan p12, pass o payload' }, { status: 400 })
    }

    // carga el PKCS#12
    const buffer = await p12File.arrayBuffer()
    const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(buffer as any))
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase)

    // extrae clave y cert
    const map = p12.getBags({
      bagType: forge.pki.oids.pkcs8ShroudedKeyBag
    })
    const keyObj = map[forge.pki.oids.pkcs8ShroudedKeyBag][0]
    const privateKey = keyObj.key as forge.pki.PrivateKey

    const certBag = p12.getBags({
      bagType: forge.pki.oids.certBag
    })[forge.pki.oids.certBag][0]
    const certificate = certBag.cert as forge.pki.Certificate

    // firma un payload (aquí, cadena simple; reemplázala con tu XML Facturae)
    const md = forge.md.sha256.create()
    md.update(payload, 'utf8')
    const signatureBytes = privateKey.sign(md)
    const signatureB64 = forge.util.encode64(signatureBytes)

    return NextResponse.json({
      signature: signatureB64,
      cert: forge.pki.certificateToPem(certificate)
    })
  } catch (e: any) {
    console.error('SIGN ERR', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
