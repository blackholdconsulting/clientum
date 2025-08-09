'use client'

import { useEffect, useMemo, useState } from 'react'

type RateRow = { base: number; iva: number }
type Summary = {
  repercutido: Record<number, RateRow>
  soportado: Record<number, RateRow>
  totalRepercutido: number
  totalSoportado: number
  prevCredit: number
  resultado: number
}
type ApiResp = {
  period: { start: string; end: string; year: number; quarter: number }
  summary: Summary
  modelo303: Record<string, number|string>
  csv: string
}

const RATES = [21, 10, 4, 0]

export default function IVAPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth()/3)+1)
  const [prevCredit, setPrevCredit] = useState(0)
  const [data, setData] = useState<ApiResp | null>(null)
  const [loading, setLoading] = useState(false)
  const years = useMemo(()=>Array.from({length:7}, (_,i)=>now.getFullYear()-3+i),[now])

  async function load() {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ year: String(year), quarter: String(quarter), prev_credit: String(prevCredit) })
      const res = await fetch(`/api/iva/summary?${qs}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, []) // primera carga
  useEffect(()=>{ load() }, [year, quarter, prevCredit])

  const s = data?.summary

  const download = (content: string, filename: string, type='text/plain') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FA] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">IVA</div>
          <div className="flex-1">
            <div className="font-semibold">Declaración de IVA</div>
            <div className="text-xs text-slate-500">Consolidado Ventas/Compras por trimestre</div>
          </div>

          <div className="flex items-center gap-2">
            <select className="border rounded-lg px-2 py-1" value={quarter} onChange={e=>setQuarter(Number(e.target.value))}>
              <option value={1}>T1 (Ene–Mar)</option>
              <option value={2}>T2 (Abr–Jun)</option>
              <option value={3}>T3 (Jul–Sep)</option>
              <option value={4}>T4 (Oct–Dic)</option>
            </select>
            <select className="border rounded-lg px-2 py-1" value={year} onChange={e=>setYear(Number(e.target.value))}>
              {years.map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
            <input
              type="number"
              step="0.01"
              className="w-36 border rounded-lg px-2 py-1"
              value={prevCredit}
              onChange={e=>setPrevCredit(Number(e.target.value))}
              placeholder="Compensación previa"
              title="Cuotas a compensar de periodos anteriores"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card title="IVA Repercutido" value={s ? s.totalRepercutido : 0} subtitle="Ventas (Devengado)" />
          <Card title="IVA Soportado" value={s ? s.totalSoportado : 0} subtitle="Compras (Deducible)" />
          <Card title="Resultado" value={s ? s.resultado : 0} subtitle={s && s.resultado >= 0 ? 'A ingresar' : 'A compensar'} highlight />
        </div>

        {/* Tabla por tipos */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 font-semibold">Detalle por tipo impositivo</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Tipo</Th>
                  <Th className="text-right">Base Repercutida</Th>
                  <Th className="text-right">IVA Repercutido</Th>
                  <Th className="text-right">Base Soportada</Th>
                  <Th className="text-right">IVA Soportado</Th>
                </tr>
              </thead>
              <tbody>
                {RATES.map(rate => (
                  <tr key={rate} className="border-t">
                    <Td>{rate}%</Td>
                    <Td right>{fmt(s?.repercutido[rate]?.base)}</Td>
                    <Td right>{fmt(s?.repercutido[rate]?.iva)}</Td>
                    <Td right>{fmt(s?.soportado[rate]?.base)}</Td>
                    <Td right>{fmt(s?.soportado[rate]?.iva)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={()=> data && download(data.csv, `iva_${year}_T${quarter}.csv`, 'text/csv')}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
          >
            Exportar CSV
          </button>
          <button
            onClick={()=> data && download(JSON.stringify(data.modelo303, null, 2), `modelo303_${year}_T${quarter}.json`, 'application/json')}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Descargar borrador 303 (JSON)
          </button>
          <button
            onClick={load}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          * Este módulo ofrece un resumen operativo. Revisa la normativa vigente (régimen general/simplificado, REBU, intracomunitarias, etc.) antes de presentar la autoliquidación.
        </p>
      </main>
    </div>
  )
}

function fmt(n?: number) {
  return (n ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Card({ title, value, subtitle, highlight=false }:{
  title: string, value: number, subtitle?: string, highlight?: boolean
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm p-4 ${highlight ? 'ring-1 ring-indigo-100' : ''}`}>
      <div className="text-xs text-slate-500">{title}</div>
      <div className={`mt-1 text-2xl font-semibold ${highlight ? 'text-indigo-700' : 'text-slate-800'}`}>
        {fmt(value)} €
      </div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  )
}

function Th({ children, className = '' }: any) {
  return <th className={`px-4 py-2 text-left font-medium text-slate-600 ${className}`}>{children}</th>
}
function Td({ children, right=false }: any) {
  return <td className={`px-4 py-2 ${right ? 'text-right' : ''}`}>{children}</td>
}
