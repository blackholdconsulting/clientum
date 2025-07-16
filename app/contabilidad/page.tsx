// app/contabilidad/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { jsPDF } from 'jspdf'
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  BarChart,
  Bar
} from 'recharts'

type Factura = { fecha_emisor: string; total: number; iva_total: number; estado: string }
type Gasto   = { fecha: string;        importe: number }

export default function ContabilidadPage() {
  const [loading, setLoading] = useState(true)
  const [resAnual, setResAnual]         = useState({ fact: 0, iva: 0, gas: 0 })
  const [resTrimestral, setResTrimestral] = useState({ fact: 0, iva: 0, gas: 0 })
  const [resMensual, setResMensual]     = useState({ fact: 0, iva: 0, gas: 0 })
  const [dataLine, setDataLine]         = useState<{ month: string; fact: number }[]>([])
  const [dataBar, setDataBar]           = useState<{ estado: string; value: number }[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return
      cargarDatos(data.session.user.id)
    })
  }, [])

  async function cargarDatos(user_id: string) {
    setLoading(true)
    const hoy = new Date(), Y = hoy.getFullYear(), M = hoy.getMonth()
    const iniA = `${Y}-01-01`
    const iniT = `${Y}-${String(Math.floor(M/3)*3+1).padStart(2,'0')}-01`
    const iniM = `${Y}-${String(M+1).padStart(2,'0')}-01`

    // facturas
    const { data: facturas } = await supabase
      .from<Factura>('facturas')
      .select('fecha_emisor, total, iva_total, estado')
      .eq('user_id', user_id)
    if (facturas) {
      const sum = (arr: number[]) => arr.reduce((a,b)=>a+b,0)
      const fil = (desde: string) => facturas.filter(f=>f.fecha_emisor>=desde)
      const A = fil(iniA), T = fil(iniT), Mx = fil(iniM)

      setResAnual({ fact: sum(A.map(x=>x.total)), iva: sum(A.map(x=>x.iva_total)), gas: 0 })
      setResTrimestral({ fact: sum(T.map(x=>x.total)), iva: sum(T.map(x=>x.iva_total)), gas: 0 })
      setResMensual({ fact: sum(Mx.map(x=>x.total)), iva: sum(Mx.map(x=>x.iva_total)), gas: 0 })

      // línea últimos 12 meses
      const meses: { month: string; start: string; end: string }[] = []
      for (let i=11; i>=0; i--) {
        const d = new Date(Y, M-i, 1)
        const MM = String(d.getMonth()+1).padStart(2,'0')
        const DD = String(new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()).padStart(2,'0')
        meses.push({
          month: `${d.getFullYear()}-${MM}`,
          start: `${d.getFullYear()}-${MM}-01`,
          end:   `${d.getFullYear()}-${MM}-${DD}`
        })
      }
      setDataLine(meses.map(m=>({
        month: m.month,
        fact: facturas
          .filter(f=>f.fecha_emisor>=m.start && f.fecha_emisor<=m.end)
          .reduce((a,b)=>a+b.total,0)
      })))

      // barras mes actual
      const estados = ['borrador','emitida','pagada']
      setDataBar(estados.map(e=>({
        estado: e,
        value: Mx.filter(f=>f.estado===e).reduce((a,b)=>a+b.total,0)
      })))
    }

    // gastos
    const { data: gastos } = await supabase
      .from<Gasto>('gastos')
      .select('fecha, importe')
      .eq('user_id', user_id)
    if (gastos) {
      const sum = (arr: number[]) => arr.reduce((a,b)=>a+b,0)
      const fil = (desde: string) => gastos.filter(x=>x.fecha>=desde).map(x=>x.importe)
      setResAnual(a=>({ ...a, gas: sum(fil(iniA)) }))
      setResTrimestral(a=>({ ...a, gas: sum(fil(iniT)) }))
      setResMensual(a=>({ ...a, gas: sum(fil(iniM)) }))
    }

    setLoading(false)
  }

  // Export CSV
  function descargarCSV() {
    const filas = [
      ['Periodo','Facturación','IVA','Gastos','Neta','EBITDA','EBDT'],
      ...[
        { label:'Anual', data: resAnual },
        { label:'Trimestral', data: resTrimestral },
        { label:'Mensual', data: resMensual }
      ].map(({ label, data }) => {
        const { fact, iva, gas } = data
        const net = fact - iva - gas
        return [label, fact, iva, gas, net, net+iva, net+gas].map(n=>n.toFixed(2))
      })
    ]
    const csv = filas.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `contabilidad_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export PDF
  function descargarPDF() {
    const doc = new jsPDF({ unit:'pt', format:'letter' })
    doc.setFontSize(18)
    doc.text('Resumen Contabilidad', 40, 50)
    let y = 80
    for (const { title, data } of [
      { title:'Anual', data: resAnual },
      { title:'Trimestral', data: resTrimestral },
      { title:'Mensual', data: resMensual }
    ]) {
      doc.setFontSize(14); doc.text(title, 40, y); y += 20
      doc.setFontSize(12)
      const { fact, iva, gas } = data
      const net = fact - iva - gas
      const lines = [
        `Facturación: ${fact.toFixed(2)} €`,
        `IVA Total: ${iva.toFixed(2)} €`,
        `Gastos: ${gas.toFixed(2)} €`,
        `Ganancia Neta: ${net.toFixed(2)} €`,
        `EBITDA: ${(net+iva).toFixed(2)} €`,
        `EBDT: ${(net+gas).toFixed(2)} €`
      ]
      for (const ln of lines) { doc.text(ln, 60, y); y += 16 }
      y += 20
    }
    doc.save(`contabilidad_${new Date().toISOString().slice(0,10)}.pdf`)
  }

  return (
    <section style={{ padding: 24 }}>
      {/* cabecera */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>📊 Contabilidad</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={descargarCSV}
            style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', borderRadius: 4 }}
          >
            Exportar CSV
          </button>
          <button
            onClick={descargarPDF}
            style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', borderRadius: 4 }}
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* estado de carga */}
      {loading ? (
        <p>Cargando datos…</p>
      ) : (
        <>
          {/* resúmenes */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 24
          }}>
            {[
              { label: 'Anual', data: resAnual },
              { label: 'Trimestral', data: resTrimestral },
              { label: 'Mensual', data: resMensual }
            ].map(({ label, data }) => {
              const net = data.fact - data.iva - data.gas
              return (
                <section key={label} style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ fontSize: 18, marginBottom: 8 }}>{label}</h2>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Facturación: {data.fact.toFixed(2)} €</li>
                    <li>IVA Total: {data.iva.toFixed(2)} €</li>
                    <li>Gastos: {data.gas.toFixed(2)} €</li>
                    <li>Ganancia Neta: {net.toFixed(2)} €</li>
                    <li>EBITDA: {(net + data.iva).toFixed(2)} €</li>
                    <li>EBDT: {(net + data.gas).toFixed(2)} €</li>
                  </ul>
                </section>
              )
            })}
          </div>

          {/* gráficas */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32
          }}>
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Evolución últimos 12 meses</h2>
              <div style={{ width: '100%', height: 240 }}>
                <LineChart data={dataLine} width={480} height={240}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fact" stroke="#8884d8" name="Facturación" />
                </LineChart>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 8 }}>Distribución por estado</h2>
              <div style={{ width: '100%', height: 240 }}>
                <BarChart data={dataBar} width={480} height={240}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="estado" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Importe" />
                </BarChart>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
