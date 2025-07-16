// app/facturas/nueva/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import type { Database } from '../../../lib/supabaseClient'

type FacturaInsert = {
  user_id: string
  cliente_id: string
  fecha_emisor: string
  fecha_vencim: string | null
  concepto: string
  base_imponib: number
  iva_percent: number
  iva_total: number
  total: number
  estado: string
  json_factura?: Record<string, any>
  enlace_pdf?: string
}

export default function NuevaFacturaPage() {
  const supabase = useSupabaseClient<Database>()
  const router = useRouter()

  // Carga de clientes para el select
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([])
  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => {
        if (data) setClientes(data)
      })
  }, [supabase])

  // Estado del formulario
  const [clienteId, setClienteId] = useState('')
  const [fechaEmisor, setFechaEmisor] = useState(new Date().toISOString().slice(0, 10))
  const [fechaVencim, setFechaVencim] = useState('')
  const [concepto, setConcepto] = useState('')
  const [base, setBase] = useState(0)
  const [ivaPct, setIvaPct] = useState(21)
  const [ivaTotal, setIvaTotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [estado, setEstado] = useState<'borrador' | 'emitida' | 'pagada' | 'vencida'>('borrador')
  const [jsonFactura, setJsonFactura] = useState('')
  const [enlacePdf, setEnlacePdf] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Recalcula IVA y Total cuando cambian base o porcentaje
  useEffect(() => {
    const iva = parseFloat(((base * ivaPct) / 100).toFixed(2))
    setIvaTotal(iva)
    setTotal(parseFloat((base + iva).toFixed(2)))
  }, [base, ivaPct])

  // Envía el formulario
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Toma la sesión justo antes de insertar
    const {
      data: { session },
      error: sessErr
    } = await supabase.auth.getSession()

    if (sessErr || !session) {
      setError('No estás autenticado')
      setLoading(false)
      return
    }

    const nueva: FacturaInsert = {
      user_id: session.user.id,
      cliente_id: clienteId,
      fecha_emisor: fechaEmisor,
      fecha_vencim: fechaVencim || null,
      concepto,
      base_imponib: base,
      iva_percent: ivaPct,
      iva_total: ivaTotal,
      total,
      estado,
      json_factura: jsonFactura ? JSON.parse(jsonFactura) : undefined,
      enlace_pdf: enlacePdf || undefined
    }

    const { error: supaError } = await supabase.from('facturas').insert(nueva)
    setLoading(false)

    if (supaError) setError(supaError.message)
    else router.push('/facturas')
  }

  return (
    <section className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">➕ Nueva Factura</h1>
      {error && <p className="text-red-600">Error: {error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {/* Selección de cliente */}
        <div>
          <label className="block mb-1 font-medium">Cliente</label>
          <select
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            required
            className="w-full border px-2 py-1 rounded"
          >
            <option value="">– Selecciona cliente –</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Fechas */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Fecha Emisión</label>
            <input
              type="date"
              value={fechaEmisor}
              onChange={e => setFechaEmisor(e.target.value)}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Fecha Vencim.</label>
            <input
              type="date"
              value={fechaVencim}
              onChange={e => setFechaVencim(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        </div>

        {/* Concepto */}
        <div>
          <label className="block mb-1 font-medium">Concepto</label>
          <textarea
            value={concepto}
            onChange={e => setConcepto(e.target.value)}
            rows={3}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Base e IVA */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Base imponible</label>
            <input
              type="number"
              step="0.01"
              value={base}
              onChange={e => setBase(parseFloat(e.target.value))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="w-24">
            <label className="block mb-1 font-medium">% IVA</label>
            <input
              type="number"
              step="0.1"
              value={ivaPct}
              onChange={e => setIvaPct(parseFloat(e.target.value))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div className="w-24">
            <label className="block mb-1 font-medium">IVA total</label>
            <input
              readOnly
              value={ivaTotal.toFixed(2)}
              className="w-full border px-2 py-1 rounded bg-gray-100"
            />
          </div>
          <div className="w-24">
            <label className="block mb-1 font-medium">Total</label>
            <input
              readOnly
              value={total.toFixed(2)}
              className="w-full border px-2 py-1 rounded bg-gray-100"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block mb-1 font-medium">Estado</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value as any)}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="borrador">borrador</option>
            <option value="emitida">emitida</option>
            <option value="pagada">pagada</option>
            <option value="vencida">vencida</option>
          </select>
        </div>

        {/* JSON interno */}
        <div>
          <label className="block mb-1 font-medium">JSON interno (opcional)</label>
          <textarea
            value={jsonFactura}
            onChange={e => setJsonFactura(e.target.value)}
            rows={2}
            placeholder='{"items":[…]}'
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Enlace PDF */}
        <div>
          <label className="block mb-1 font-medium">Enlace PDF (opcional)</label>
          <input
            type="url"
            value={enlacePdf}
            onChange={e => setEnlacePdf(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/facturas')}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Guardar Factura'}
          </button>
        </div>
      </form>
    </section>
  )
}
