import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Invoice } from '@/lib/invoice'
import { calcHash, buildQR } from '@/lib/verifactu'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { invoice } = (await req.json()) as { invoice: Invoice }

  // Usuario actual
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user.id

  // 1) Preferimos org_issuer; si no existe, usamos perfil del usuario
  let issuerNif = process.env.ISSUER_NIF || ''
  let softwareId = process.env.VERIFACTU_SOFTWARE_ID || 'CLIENTUM'
  let mode = (process.env.VERIFACTU_MODE ?? 'test') as 'test'|'prod'
  let defaultSeries = process.env.VERIFACTU_SERIES ?? 'GEN'

  const { data: issuer } = await supabase.from('org_issuer').select('*').eq('org_id', invoice.orgId).maybeSingle()
  if (issuer) {
    issuerNif = issuer.issuer_nif || issuerNif
    softwareId = issuer.verifactu_software_id || softwareId
    mode = (issuer.verifactu_mode as any) || mode
    defaultSeries = issuer.default_series || defaultSeries
  } else {
    // Fallback a PERFIL (por user_id), como pides
    const { data: perfil } = await supabase.from('perfil').select('nif').eq('user_id', userId ?? invoice.orgId).maybeSingle()
    if (perfil?.nif) issuerNif = perfil.nif
  }

  const series = invoice.series ?? defaultSeries

  // 2) Eslabón previo de la cadena (org = user_id)
  const orgKey = invoice.orgId || userId
  const { data: chain } = await supabase
    .from('verifactu_chain')
    .select('last_hash')
    .eq('org_id', orgKey)
    .eq('series', series)
    .maybeSingle()

  const prevHash = chain?.last_hash ?? null

  // 3) Hash y QR
  const hash = calcHash(invoice, issuerNif!, prevHash)
  const qr = await buildQR(invoice, issuerNif!, hash)

  const registro = {
    softwareId, mode, issuerNif,
    orgId: orgKey, series,
    invoiceNumber: invoice.number, issueDate: invoice.issueDate, issueTime: invoice.issueTime ?? '00:00:00',
    total: Number(invoice.total.toFixed(2)), prevHash, hash, qrUrl: qr.url
  }

  // 4) Guarda cadena (con control de concurrencia)
  if (!chain) {
    await supabase.from('verifactu_chain').insert({ org_id: orgKey, series, last_hash: hash })
  } else {
    const { data: updated, error: upderr } = await supabase
      .from('verifactu_chain')
      .update({ last_hash: hash, updated_at: new Date().toISOString() })
      .eq('org_id', orgKey).eq('series', series).eq('last_hash', prevHash)
      .select()
    if (upderr) return Response.json({ ok:false, error: upderr.message }, { status: 500 })
    if (!updated || updated.length === 0) {
      return Response.json({ ok:false, conflict:true, message:'Cadena actualizada por otra operación. Reintenta.' }, { status: 409 })
    }
  }

  await supabase.from('verifactu_events').insert({
    org_id: orgKey, invoice_id: invoice.id, kind:'alta', payload: registro
  })

  return Response.json({ ok:true, registro, qrPngDataUrl: qr.dataUrl })
}
