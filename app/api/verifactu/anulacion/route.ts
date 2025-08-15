// app/api/verifactu/anulacion/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Invoice } from '@/lib/invoice'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { invoice, motivo } = await req.json() as { invoice: Invoice, motivo?: string }

  const { data: issuer } = await supabase
    .from('org_issuer')
    .select('issuer_nif')
    .eq('org_id', invoice.orgId)
    .maybeSingle()

  const payload = {
    orgId: invoice.orgId,
    issuerNif: issuer?.issuer_nif ?? process.env.ISSUER_NIF!,
    invoiceNumber: invoice.number,
    reason: motivo ?? 'Anulación por error'
  }

  let forward: any = null
  if (process.env.VERIFACTI_API_URL && process.env.VERIFACTI_API_KEY) {
    try {
      const res = await fetch(`${process.env.VERIFACTI_API_URL}/v1/anulacion`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.VERIFACTI_API_KEY}` },
        body: JSON.stringify(payload)
      })
      forward = { ok: res.ok, status: res.status }
    } catch (e:any) {
      forward = { ok:false, error: String(e?.message || e) }
    }
  }

  await supabase.from('verifactu_events').insert({
    org_id: invoice.orgId, invoice_id: invoice.id, kind:'anulacion', payload, response: forward
  })

  return Response.json({ ok:true, payload })
}
