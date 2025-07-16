// app/facturas/[id]/page.tsx
'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import SidebarLayout from '@/components/Layout'
import type { Database } from '../../../lib/supabaseClient'

type FacturaRow = Database['public']['Tables']['facturas']['Row']
type ClienteRow = Database['public']['Tables']['clientes']['Row']
type SiiLog = { estado: string; codigo: string; descripcion: string; enviado_at: string }

export default function FacturaDetailPage() {
  const supabase = useSupabaseClient<Database>()
  const { id } = useParams() as { id: string }

  const [factura, setFactura] = useState<FacturaRow | null>(null)
  const [cliente, setCliente] = useState<ClienteRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [siiLog, setSiiLog] = useState<SiiLog | null>(null)

  // Carga factura y cliente
  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('facturas')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) throw new Error(error?.message || 'Factura no encontrada')
        setFactura(data)
        return supabase
          .from('clientes')
          .select('*')
          .eq('id', data.cliente_id)
          .single()
      })
      .then(res => {
        if (res.data) setCliente(res.data)
      })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id, supabase])

  // Carga último log SII
  useEffect(() => {
    if (!factura) return
    supabase
      .from('sii_logs')
      .select('estado, codigo, descripcion, enviado_at')
      .eq('factura_id', factura.id)
      .order('enviado_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => data && setSiiLog(data))
      .catch(console.error)
  }, [factura, supabase])

  // Abre PDF en nueva pestaña a ancho completo
  const handleViewPDF = async () => {
    if (!factura || !cliente) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 60
    doc.setFontSize(22).text('Factura', 40, y); y += 30
    doc.setFontSize(12)
    doc.text(`ID: ${factura.id}`, 40, y); y += 20
    doc.text(`Emisión: ${factura.fecha_emisor}`, 40, y); y += 20
    doc.text(`Vencimiento: ${factura.fecha_vencim || '—'}`, 40, y); y += 30
    doc.setFontSize(14).text('Datos del Cliente', 40, y); y += 20
    doc.setFontSize(12)
    doc.text(`Nombre: ${cliente.nombre}`, 40, y); y += 18
    doc.text(`Email: ${cliente.email}`, 40, y); y += 18
    if (cliente.razon_social) { doc.text(`Razón social: ${cliente.razon_social}`, 40, y); y += 18 }
    if (cliente.nif) { doc.text(`NIF: ${cliente.nif}`, 40, y); y += 30 }
    doc.setFontSize(14).text('Concepto y Totales', 40, y); y += 20
    doc.setFontSize(12)
    doc.text(`Concepto: ${factura.concepto}`, 40, y); y += 18
    doc.text(`Total: ${factura.total.toFixed(2)} €`, 40, y)
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  // Descargar XML firmado
  const handleDownloadSignedXML = async () => {
    if (!factura || !cliente) return
    try {
      const gen = await fetch('/api/facturas/generar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ factura, cliente }) })
      const { xml, error: genErr } = await gen.json()
      if (!xml) throw new Error(genErr || 'Error generando XML')

      const sign = await fetch('/api/facturas/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xml }) })
      const { signedXml, error: signErr } = await sign.json()
      if (!signedXml) throw new Error(signErr || 'Error firmando XML')

      const blob = new Blob([signedXml], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${factura.id}.xml`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Enviar factura al SII
  const handleSendInvoice = async () => {
    if (!factura || !cliente) return
    try {
      const genRes = await fetch('/api/facturas/generar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ factura, cliente }) })
      const { xml, error: genErr } = await genRes.json()
      if (!xml) throw new Error(genErr || 'Error generando XML')

      const signRes = await fetch('/api/facturas/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xml }) })
      const { signedXml, error: signErr } = await signRes.json()
      if (!signedXml) throw new Error(signErr || 'Error firmando XML')

      const sendRes = await fetch('/api/sii/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facturaId: factura.id, signedXml }) })
      const siiJson = await sendRes.json()
      if (!sendRes.ok) throw new Error(siiJson.error || 'Error envío SII')

      const { data } = await supabase
        .from('sii_logs')
        .select('estado, codigo, descripcion, enviado_at')
        .eq('factura_id', factura.id)
        .order('enviado_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setSiiLog(data)

      alert(`Envío SII: ${siiJson.estado}`)
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) return <div className="p-6">Cargando factura…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!factura || !cliente) return null

  return (
    <SidebarLayout>
      <Link href="/facturas" className="text-indigo-600 hover:underline mb-4 block">← Volver al listado</Link>

      <h1 className="text-3xl font-bold mb-6">Factura #{factura.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-1">
          <p><strong>Cliente:</strong> {cliente.nombre}</p>
          <p><strong>Email:</strong>  {cliente.email}</p>
          <p><strong>Emisión:</strong> {factura.fecha_emisor}</p>
          <p><strong>Vencimiento:</strong> {factura.fecha_vencim || '—'}</p>
        </div>
        <div className="space-y-1">
          <p><strong>Concepto:</strong> {factura.concepto}</p>
          <p><strong>Total:</strong>    {factura.total.toFixed(2)} €</p>
          <p><strong>Estado:</strong>   {factura.estado}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={handleViewPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ver PDF</button>
        <button onClick={handleDownloadSignedXML} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Descargar XML firmado</button>
        <button onClick={handleSendInvoice} className="px-4 ph-2 bg-purple-600 text-white rounded hover:bg-purple-700">Enviar SII</button>
      </div>

      {siiLog && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Último envío SII</h2>
          <p><strong>Estado:</strong>      {siiLog.estado}</p>
          <p><strong>Código:</strong>      {siiLog.codigo}</p>
          <p><strong>Descripción:</strong> {siiLog.descripcion}</p>
        </div>
      )}
    </SidebarLayout>
  )
}