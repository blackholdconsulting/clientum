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

  // 1) Carga emisor/ajustes de la org (o fallback a env)
  const { data: issuer } = await supabase
    .from('org_issuer')
    .select('*')
    .eq('org_id', invoice.orgId)
    .maybeSingle()

  const issuerNif = issuer?.issuer_nif ?? process.env.ISSUER_NIF!
  const softwareId = issuer?.verifactu_software_id ?? process.env.VERIFACTU_SOFTWARE_ID ?? 'CLIENTUM'
  const mode = (issuer?.verifactu_mode ?? process.env.VERIFACTU_MODE ?? 'test') as 'test'|'prod'
  const series = invoice.series ?? issuer?.default_series ?? process.env.VERIFACTU_SERIES ?? 'GEN'

  // 2) Lee la cadena actual (prevHash) para org+serie
  const { data: chain } = await supabase
    .from('verifactu_chain')
    .select('last_hash')
    .eq('org_id', invoice.orgId)
    .eq('series', series)
    .maybeSingle()

  const prevHash = chain?.last_hash ?? null

  // 3) Calcula hash y QR
  const hash = calcHash(invoice, issuerNif, prevHash)
  const qr = await buildQR(invoice, issuerNif, hash)

  const registro = {
    softwareId, mode, issuerNif,
    orgId: invoice.orgId,
    series,
    invoiceNumber: invoice.number,
    issueDate: invoice.issueDate,
    issueTime: invoice.issueTime ?? '00:00:00',
    total: Number(invoice.total.toFixed(2)),
    prevHash,
    hash,
    qrUrl: qr.url
  }

  // 4) Reenvío opcional a agregador (si tienes VERIFACTI configurado)
  let forward: any = null
  const apiUrl = process.env.VERIFACTI_API_URL
  const apiKey = process.env.VERIFACTI_API_KEY
  if (apiUrl && apiKey) {
    try {
      const res = await fetch(`${apiUrl}/v1/alta`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ registro })
      })
      forward = { ok: res.ok, status: res.status }
    } catch (e:any) {
      forward = { ok:false, error: String(e?.message || e) }
    }
  }

  // 5) Guardar cadena con control de concurrencia (optimista):
  //    - si NO existía: insert
  //    - si existía: update con condición last_hash = prevHash
  if (!chain) {
    // primera de la serie para esa org
    await supabase.from('verifactu_chain').insert({
      org_id: invoice.orgId, series, last_hash: hash
    })
  } else {
    const { data: upd, error: upderr, count } = await supabase
      .from('verifactu_chain')
      .update({ last_hash: hash, updated_at: new Date().toISOString() })
      .eq('org_id', invoice.orgId)
      .eq('series', series)
      .eq('last_hash', prevHash)             // <- control
      .select('*', { count: 'exact' })

    if ((count ?? 0) === 0) {
      // alguien insertó antes; recomputar y reintentar si quieres (simplemente avisa)
      return Response.json({ ok:false, conflict:true, message:'Cadena actualizada por otra operación. Reintenta.' }, { status: 409 })
    }
  }

  // 6) Log del evento
  await supabase.from('verifactu_events').insert({
    org_id: invoice.orgId, invoice_id: invoice.id, kind:'alta', payload: registro, response: forward
  })

  return Response.json({ ok:true, registro, qrPngDataUrl: qr.dataUrl })
}
