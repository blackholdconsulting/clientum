// app/api/verifactu/alta/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Invoice } from '@/lib/invoice'
import { calcHash, buildQR } from '@/lib/verifactu'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { invoice } = await req.json() as { invoice: Invoice }

  // Emisor por organización (usa tu tabla org_issuer si la tienes)
  const { data: issuer } = await supabase
    .from('org_issuer')
    .select('*')
    .eq('org_id', invoice.orgId)
    .maybeSingle()

  const issuerNif = issuer?.issuer_nif ?? process.env.ISSUER_NIF!
  const softwareId = issuer?.verifactu_software_id ?? process.env.VERIFACTU_SOFTWARE_ID ?? 'CLIENTUM'
  const mode = (issuer?.verifactu_mode ?? process.env.VERIFACTU_MODE ?? 'test') as 'test'|'prod'
  const series = invoice.series ?? issuer?.default_series ?? process.env.VERIFACTU_SERIES ?? 'GEN'

  // Trae eslabón previo de la cadena
  const { data: chain } = await supabase
    .from('verifactu_chain')
    .select('last_hash')
    .eq('org_id', invoice.orgId)
    .eq('series', series)
    .maybeSingle()

  const prevHash = chain?.last_hash ?? null
  const hash = calcHash(invoice, issuerNif, prevHash)
  const qr = await buildQR(invoice, issuerNif, hash)

  const registro = {
    softwareId, mode, issuerNif, orgId: invoice.orgId, series,
    invoiceNumber: invoice.number, issueDate: invoice.issueDate,
    issueTime: invoice.issueTime ?? '00:00:00', total: Number(invoice.total.toFixed(2)),
    prevHash, hash, qrUrl: qr.url
  }

  // (Opcional) reenviar a un agregador externo
  let forward: any = null
  if (process.env.VERIFACTI_API_URL && process.env.VERIFACTI_API_KEY) {
    try {
      const res = await fetch(`${process.env.VERIFACTI_API_URL}/v1/alta`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.VERIFACTI_API_KEY}` },
        body: JSON.stringify({ registro })
      })
      forward = { ok: res.ok, status: res.status }
    } catch (e:any) {
      forward = { ok:false, error: String(e?.message || e) }
    }
  }

  // Guarda cadena con control de concurrencia
  if (!chain) {
    await supabase.from('verifactu_chain').insert({ org_id: invoice.orgId, series, last_hash: hash })
  } else {
    const { count } = await supabase
      .from('verifactu_chain')
      .update({ last_hash: hash, updated_at: new Date().toISOString() })
      .eq('org_id', invoice.orgId).eq('series', series).eq('last_hash', prevHash)
      .select('*', { count:'exact' })
    if ((count ?? 0) === 0) {
      return Response.json({ ok:false, conflict:true, message:'Cadena actualizada por otra operación. Reintenta.' }, { status: 409 })
    }
  }

  await supabase.from('verifactu_events').insert({
    org_id: invoice.orgId, invoice_id: invoice.id, kind:'alta', payload: registro, response: forward
  })

  return Response.json({ ok:true, registro, qrPngDataUrl: qr.dataUrl })
}
