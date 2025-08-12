// app/api/factura-electronica/route.ts
import { NextRequest } from 'next/server'
import { buildFacturae322 } from '@/lib/facturae'
import { Invoice } from '@/lib/invoice'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { invoice } = await req.json() as { invoice: Invoice }
  const unsignedXml = buildFacturae322(invoice)

  // Si defines un firmador externo (SIGNER_MODE=api + SIGNER_API_URL),
  // enviamos el XML para que te devuelva el XAdES (.xsig)
  if ((process.env.SIGNER_MODE ?? 'none') === 'api' && process.env.SIGNER_API_URL) {
    const r = await fetch(process.env.SIGNER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: unsignedXml,
    })
    if (!r.ok) {
      const t = await r.text().catch(()=> '')
      return new Response(`Signer API error: ${t || r.statusText}`, { status: 502 })
    }
    const xsig = await r.text()
    return new Response(xsig, {
      headers: {
        'Content-Type':'application/xml',
        'Content-Disposition': `attachment; filename="${invoice.number}.xsig"`
      }
    })
  }

  // Por defecto: devolvemos XML sin firmar (compila y te sirve para validar XSD).
  return new Response(unsignedXml, {
    headers: {
      'Content-Type': 'application/xml',
      'X-Signed': 'false',
      'Content-Disposition': `attachment; filename="${invoice.number}.xml"`
    }
  })
}
