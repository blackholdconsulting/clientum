// app/api/factura-electronica/route.ts
import { NextRequest } from 'next/server'
import { buildFacturae322 } from '@/lib/facturae'
import { Invoice } from '@/lib/invoice'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { invoice } = (await req.json()) as { invoice: Invoice }
    const unsignedXml = buildFacturae322(invoice)

    // Pequeña guarda: si por error fuese HTML, avisamos
    if (!unsignedXml.startsWith('<?xml') && !unsignedXml.includes('<Facturae')) {
      return new Response('Generation error: not XML', { status: 500 })
    }

    return new Response(unsignedXml, {
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'X-Signed': 'false',
        'Content-Disposition': `attachment; filename="${invoice.number || 'factura'}.xml"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return new Response('Bad request', { status: 400 })
  }
}
