// app/api/iva/summary/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function quarterRange(year: number, q: number) {
  const startMonths = {1: '01', 2: '04', 3: '07', 4: '10'} as const
  const endMonths   = {1: '03', 2: '06', 3: '09', 4: '12'} as const
  const start = `${year}-${startMonths[q as 1|2|3|4]}-01`
  const end   = new Date(year, {1:3,2:6,3:9,4:12}[q as 1|2|3|4], 0) // último día del mes fin
  const endStr= end.toISOString().slice(0,10)
  return { start, end: endStr }
}

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(req.url)

  const year = Number(searchParams.get('year') ?? new Date().getFullYear())
  const quarter = Number(searchParams.get('quarter') ?? Math.floor((new Date().getMonth())/3)+1)
  const prevCredit = Number(searchParams.get('prev_credit') ?? 0) // compensación previa (si procede)

  if (![1,2,3,4].includes(quarter)) {
    return Response.json({ error: 'quarter must be 1..4' }, { status: 400 })
  }
  const { start, end } = quarterRange(year, quarter)

  // Trae todas las líneas de la vista unificada
  const { data, error } = await supabase
    .from('v_iva_lines')
    .select('kind, op_date, tax_rate, base, iva')
    .gte('op_date', start)
    .lte('op_date', end)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  type Row = { kind: 'sale'|'purchase'; tax_rate: number; base: number; iva: number }
  const rows = (data ?? []) as Row[]

  // Acumuladores
  const rates = [21, 10, 4, 0]
  const repercutido: Record<number, {base:number, iva:number}> = Object.fromEntries(rates.map(r=>[r,{base:0,iva:0}]))
  const soportado:   Record<number, {base:number, iva:number}> = Object.fromEntries(rates.map(r=>[r,{base:0,iva:0}]))

  for (const r of rows) {
    const bucket = (r.kind === 'sale') ? repercutido : soportado
    const rate = rates.includes(r.tax_rate) ? r.tax_rate : 21
    bucket[rate].base += Number(r.base || 0)
    bucket[rate].iva  += Number(r.iva  || 0)
  }

  // Totales
  const totalRepercutido = rates.reduce((s,rate)=> s + repercutido[rate].iva, 0)
  const totalSoportado   = rates.reduce((s,rate)=> s + soportado[rate].iva, 0)
  const resultado        = +(totalRepercutido - totalSoportado - prevCredit).toFixed(2)

  // Borrador de Modelo 303 (mínimo, régimen general)
  const m303 = {
    year, quarter,
    // Devengado:
    '01_base_21': +repercutido[21].base.toFixed(2),
    '02_cuota_21': +repercutido[21].iva.toFixed(2),
    '03_base_10': +repercutido[10].base.toFixed(2),
    '04_cuota_10': +repercutido[10].iva.toFixed(2),
    '05_base_4':  +repercutido[4].base.toFixed(2),
    '06_cuota_4': +repercutido[4].iva.toFixed(2),
    '12_total_devengado': +totalRepercutido.toFixed(2),
    // Deducible:
    '28_soportado_bienes_servicios': +totalSoportado.toFixed(2),
    '44_cuotas_a_compensar_previas': +prevCredit.toFixed(2),
    // Resultado
    '46_resultado_liquidacion': resultado, // >0 a ingresar, <0 a compensar
  }

  // CSV simple (líneas)
  const csvHeader = 'kind,op_date,tax_rate,base,iva'
  const csvLines = rows.map(r => `${r.kind},${r.tax_rate},${r.tax_rate},${r.base},${r.iva}`)
  const csv = [csvHeader, ...csvLines].join('\n')

  return Response.json({
    period: { start, end, year, quarter },
    summary: { repercutido, soportado, totalRepercutido, totalSoportado, prevCredit, resultado },
    modelo303: m303,
    csv
  })
}
