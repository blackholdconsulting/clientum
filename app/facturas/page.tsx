// app/facturas/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { jsPDF } from 'jspdf'
import type { Database } from '../../lib/supabaseClient'

type Factura = Database['public']['Tables']['facturas']['Row']
type Cliente = Database['public']['Tables']['clientes']['Row']

export default function FacturasPage() {
  const supabase = useSupabaseClient<Database>()

  const [facturas, setFacturas] = useState<Factura[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clienteFilter, setClienteFilter] = useState('')
  const [estadoFilter, setEstadoFilter]   = useState('')
  const [desdeFilter, setDesdeFilter]     = useState('')
  const [hastaFilter, setHastaFilter]     = useState('')

  useEffect(() => {
    fetchClientes()
    fetchFacturas()
  }, [])

  useEffect(() => {
    fetchFacturas()
  }, [clienteFilter, estadoFilter, desdeFilter, hastaFilter])

  async function fetchClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('id, nombre')
      .order('nombre')
    if (data) setClientes(data)
  }

  async function fetchFacturas() {
    setLoading(true)
    let q = supabase
      .from('facturas')
      .select('*')
      .order('created_at', { ascending: false })

    if (clienteFilter) q = q.eq('cliente_id', clienteFilter)
    if (estadoFilter)  q = q.eq('estado', estadoFilter)
    if (desdeFilter)   q = q.gte('fecha_emisor', desdeFilter)
    if (hastaFilter)   q = q.lte('fecha_emisor', hastaFilter)

    const { data, error } = await q
    if (error) setError(error.message)
    else      setFacturas(data ?? [])
    setLoading(false)
  }

  function resetFiltros() {
    setClienteFilter('')
    setEstadoFilter('')
    setDesdeFilter('')
    setHastaFilter('')
  }

  function handleExportCSV() {
    if (!facturas.length) return
    const headers = Object.keys(facturas[0])
    const rows = facturas.map(f =>
      headers.map(h => JSON.stringify((f as any)[h] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'facturas.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    doc.setFontSize(16)
    doc.text('Listado de Facturas', 40, 50)
    const startY = 80, lh = 18
    const cols = ['ID','Cliente','Estado','Emisión','Vencim.','Concepto','Total']
    cols.forEach((c,i) => doc.text(c, 40 + i*80, startY))
    facturas.forEach((f,idx) => {
      const y = startY + lh*(idx+1)
      const nombre = clientes.find(c=>c.id===f.cliente_id)?.nombre || f.cliente_id
      const vals = [
        f.id,
        nombre,
        f.estado,
        f.fecha_emisor,
        f.fecha_vencim ?? '',
        f.concepto,
        f.total?.toString() ?? ''
      ]
      vals.forEach((v,i)=> doc.text(v, 40 + i*80, y))
    })
    doc.save('facturas.pdf')
  }

  return (
    <section style={{ padding: 24 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>📑 Facturas</h1>
        <a
          href="/facturas/nueva"
          style={{
            padding: '6px 12px',
            backgroundColor: '#4f46e5',
            color: '#fff',
            borderRadius: 4,
            textDecoration: 'none'
          }}
        >
          + Nueva Factura
        </a>
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        margin: '16px 0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Cliente</label>
          <select
            style={{ padding: 4 }}
            value={clienteFilter}
            onChange={e => setClienteFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Estado</label>
          <select
            style={{ padding: 4 }}
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="borrador">borrador</option>
            <option value="emitida">emitida</option>
            <option value="pagada">pagada</option>
            <option value="vencida">vencida</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Emisión desde</label>
          <input
            type="date"
            style={{ padding: 4 }}
            value={desdeFilter}
            onChange={e => setDesdeFilter(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Emisión hasta</label>
          <input
            type="date"
            style={{ padding: 4 }}
            value={hastaFilter}
            onChange={e => setHastaFilter(e.target.value)}
          />
        </div>

        <button
          onClick={resetFiltros}
          style={{
            padding: '6px 12px',
            backgroundColor: '#e5e7eb',
            borderRadius: 4
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={handleExportCSV}
          style={{
            padding: '6px 12px',
            backgroundColor: '#2563eb',
            color: '#fff',
            borderRadius: 4
          }}
        >
          Exportar CSV
        </button>
        <button
          onClick={handleExportPDF}
          style={{
            padding: '6px 12px',
            backgroundColor: '#16a34a',
            color: '#fff',
            borderRadius: 4
          }}
        >
          Exportar PDF
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading && <p>Cargando facturas…</p>}

      {!loading && facturas.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                {['ID','Cliente','Estado','Emisión','Vencim.','Concepto','Total','Acciones'].map(h => (
                  <th
                    key={h}
                    style={{
                      border: '1px solid #d1d5db',
                      padding: 8,
                      textAlign: 'left'
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => {
                const nom = clientes.find(c => c.id === f.cliente_id)?.nombre || f.cliente_id
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>{f.id}</td>
                    <td style={{ padding: 8 }}>{nom}</td>
                    <td style={{ padding: 8 }}>{f.estado}</td>
                    <td style={{ padding: 8 }}>{f.fecha_emisor}</td>
                    <td style={{ padding: 8 }}>{f.fecha_vencim || '—'}</td>
                    <td style={{ padding: 8 }}>{f.concepto}</td>
                    <td style={{ padding: 8 }}>{f.total}</td>
                    <td style={{ padding: 8 }}>
                      <a
                        href={`/facturas/${f.id}`}
                        style={{
                          color: '#4f46e5',
                          textDecoration: 'underline'
                        }}
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No hay facturas.</p>
      )}
    </section>
  )
}
