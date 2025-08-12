import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { buildFacturae322 } from '@/lib/facturae'
import { Invoice, Party } from '@/lib/invoice'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { invoice } = (await req.json()) as { invoice: Invoice }

  // Cargar PERFIL del usuario (o deja seller como viene)
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user.id
  let seller: Party | null = null

  const { data: perfil } = await supabase
    .from('perfil')
    .select('nombre_empr,nif,direccion,ciudad,provincia,cp,pais')
    .eq('user_id', userId ?? invoice.orgId)
    .maybeSingle()

  if (perfil) {
    seller = {
      name: perfil.nombre_empr, nif: perfil.nif,
      address: perfil.direccion, city: perfil.ciudad, province: perfil.provincia, zip: perfil.cp, country: perfil.pais || 'ESP'
    }
  }

  const inv: Invoice = { ...invoice, seller: seller ?? invoice.seller }
  const unsignedXml = buildFacturae322(inv)

  // Firma externa opcional
  if ((process.env.SIGNER_MODE ?? 'none') === 'api' && process.env.SIGNER_API_URL) {
    const r = await fetch(process.env.SIGNER_API_URL, { method:'POST', headers:{ 'Content-Type':'application/xml' }, body: unsignedXml })
    if (!r.ok) return new Response(`Signer API error: ${await r.text()}`, { status: 502 })
    const xsig = await r.text()
    return new Response(xsig, {
      headers: { 'Content-Type':'application/xml', 'Content-Disposition': `attachment; filename="${invoice.number}.xsig"` }
    })
  }

  return new Response(unsignedXml, {
    headers: {
      'Content-Type':'application/xml',
      'X-Signed':'false',
      'Content-Disposition': `attachment; filename="${invoice.number}.xml"`
    }
  })
}
