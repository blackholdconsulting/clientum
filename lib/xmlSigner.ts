// lib/xmlSigner.ts
import { SignedXml } from 'xml-crypto'
import { createClient } from '@supabase/supabase-js'
import streamBuffers from 'stream-buffers'

// Inicializa Supabase con la Service Role Key para poder descargar cualquier archivo
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function signXMLForUser(userId: string, xmlString: string): Promise<string> {
  // 1) Descargar la clave privada
  const privPath = `${userId}/private_key.pem`
  const certPath = `${userId}/certificate.pem`
  const { data: privData, error: e1 } = await supabase
    .storage.from('certs')
    .download(privPath)
  if (e1 || !privData) throw new Error('No se pudo descargar private_key.pem')

  const { data: certData, error: e2 } = await supabase
    .storage.from('certs')
    .download(certPath)
  if (e2 || !certData) throw new Error('No se pudo descargar certificate.pem')

  // 2) Convertir blobs a strings
  const toPem = async (blob: Blob) => {
    const buf = await blob.arrayBuffer()
    return Buffer.from(buf).toString('utf-8')
  }
  const privateKey  = await toPem(privData)
  const certificate = await toPem(certData)

  // 3) Firmar con xml-crypto
  const sig = new SignedXml()
  sig.addReference(
    "/*", 
    ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    "http://www.w3.org/2001/04/xmlenc#sha256"
  )
  sig.signingKey = privateKey
  sig.keyInfoProvider = {
    getKeyInfo: () =>
      `<X509Data><X509Certificate>${certificate
        .replace(/-----BEGIN CERTIFICATE-----/, "")
        .replace(/-----END CERTIFICATE-----/, "")
        .replace(/\r?\n/g, "")}</X509Certificate></X509Data>`,
    getKey: () => Buffer.from(privateKey),
  }
  sig.computeSignature(xmlString, { location: { reference: "/*", action: "append" } })
  return sig.getSignedXml()
}
