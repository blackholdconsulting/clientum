// app/presupuestos/page.tsx
'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { jsPDF } from 'jspdf'

type Linea = { descripcion: string; unidades: number; precioUnitario: number }
type Perfil = {
  nombre: string
  apellidos: string
  telefono: string
  idioma: string
  nombre_empr: string
  nif: string
  direccion: string
  ciudad: string
  provincia: string
  cp: string
  pais: string
  email: string
  web: string
  iban: string
}
type ClienteRow = {
  id: string
  nombre: string
  direccion: string
  cif: string
  cp: string
  email: string
}

export default function PresupuestosPage() {
  const supabase = createPagesBrowserClient()

  // — carga perfil y clientes —
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [cliente, setCliente] = useState<ClienteRow | null>(null)

  useEffect(() => {
    (async () => {
      // 1) Obtengo el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 2) Traigo perfil (¡idéntico a app/profile/page.tsx!)
      const { data: p, error: errP } = await supabase
        .from('perfil')
        .select(
          `nombre,apellidos,telefono,idioma,
           nombre_empr,nif,direccion,ciudad,provincia,cp,pais,
           email,web,iban`
        )
        .eq('id', user.id)
        .single()
      if (errP) console.error(errP)
      else if (p) setPerfil(p as Perfil)

      // 3) Traigo lista de clientes
      const { data: cls, error: errC } = await supabase
        .from('clientes')
        .select('id,nombre,direccion,cif,cp,email')
        .order('nombre', { ascending: true })
      if (errC) console.error(errC)
      else if (cls) setClientes(cls as ClienteRow[])
    })()
  }, [supabase])

  // — si aún no llegó el perfil...
  if (!perfil) {
    return <div className="p-6">Cargando tus datos…</div>
  }

  // — formulario y estado de presupuesto —
  const [fecha, setFecha] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: '', unidades: 1, precioUnitario: 0 },
  ])
  const [iva, setIva] = useState(21)
  const [irpf, setIrpf] = useState(0)

  const addLinea = () =>
    setLineas((ls) => [...ls, { descripcion: '', unidades: 1, precioUnitario: 0 }])
  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLineas((ls) =>
      ls.map((l, idx) =>
        idx === i
          ? {
              ...l,
              [name]: name === 'descripcion' ? value : Number(value),
            }
          : l
      )
    )
  }

  const calcularTotales = () => {
    const base = lineas.reduce((s, l) => s + l.unidades * l.precioUnitario, 0)
    const ivaImp = (base * iva) / 100
    const irpfImp = (base * irpf) / 100
    return { base, ivaImp, irpfImp, total: base + ivaImp - irpfImp }
  }

  const exportCSV = () => {
    const { base, ivaImp, irpfImp } = calcularTotales()
    const header = [
      'Fecha',
      'Número',
      'Vencimiento',
      'Empresa',
      'Cliente',
      'Descripción',
      'Unidades',
      'P.Unit',
      'Importe',
      'Comentarios',
    ]
    const rows = lineas.map((l) => [
      fecha,
      numero,
      vencimiento,
      perfil.nombre_empr,
      cliente?.nombre || '',
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
      comentarios,
    ])
    rows.push(['', '', '', '', '', 'BASE', '', '', base.toFixed(2), ''])
    rows.push(['', '', '', '', '', `IVA(${iva}%)`, '', '', ivaImp.toFixed(2), ''])
    rows.push(['', '', '', '', '', `IRPF(${irpf}%)`, '', '', (-irpfImp).toFixed(2), ''])
    rows.push(['', '', '', '', '', 'TOTAL', '', '', calcularTotales().total.toFixed(2), ''])

    const csv =
      [header, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\r\n') +
      `\r\n\r\nComentarios: ${comentarios}\r\nIBAN: ${perfil.iban}`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `presupuesto-${numero || 'sin-numero'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40

    doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(0, 102, 204)
    doc.text('Presupuesto', 40, y)
    y += 30
    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(0)
    doc.text(`Fecha: ${fecha}`, 40, y)
    doc.text(`Núm.: ${numero}`, 300, y)
    y += 16
    doc.text(`Vto.: ${vencimiento}`, 40, y)
    y += 30

    doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(0, 102, 204)
    doc.text(perfil.nombre_empr, 40, y)
    doc.text(cliente?.nombre || 'Cliente', 300, y)
    y += 20

    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60)
    doc.text(`Teléfono: ${perfil.telefono}`, 40, y)
    doc.text(`Email: ${perfil.email}`, 300, y)
    y += 14
    doc.text(`Dirección: ${perfil.direccion}`, 40, y)
    doc.text(`Ciudad/CP: ${perfil.ciudad}/${perfil.cp}`, 300, y)
    y += 14
    doc.text(`NIF: ${perfil.nif}`, 40, y)
    doc.text(`IBAN: ${perfil.iban}`, 300, y)
    y += 30

    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0, 102, 204)
    ;['Descripción', 'Unid.', 'P.Unit (€)', 'Importe (€)'].forEach((h, i) => {
      doc.text(h, 40 + i * 130, y)
    })
    y += 16
    doc.setLineWidth(0.5).line(40, y, 550, y)
    y += 10

    doc.setFont('helvetica', 'normal').setTextColor(0)
    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y)
      doc.text(String(l.unidades), 170, y, { align: 'right' })
      doc.text(l.precioUnitario.toFixed(2), 300, y, { align: 'right' })
      doc.text((l.unidades * l.precioUnitario).toFixed(2), 430, y, { align: 'right' })
      y += 18
      if (y > 750) {
        doc.addPage()
        y = 40
      }
    })

    const tot = calcularTotales()
    y += 20
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0, 102, 204)
    doc.text('BASE:', 300, y)
    doc.text(`${tot.base.toFixed(2)} €`, 550, y, { align: 'right' })
    y += 16
    doc.text(`IVA (${iva}%):`, 300, y)
    doc.text(`${tot.ivaImp.toFixed(2)} €`, 550, y, { align: 'right' })
    y += 16
    doc.text(`IRPF (${irpf}%):`, 300, y)
    doc.text(`${(-tot.irpfImp).toFixed(2)} €`, 550, y, { align: 'right' })
    y += 16
    doc.setFontSize(16).setTextColor(0)
    doc.text('TOTAL:', 300, y)
    doc.text(`${tot.total.toFixed(2)} €`, 550, y, { align: 'right' })
    y += 30

    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60)
    doc.text(`Comentarios: ${comentarios}`, 40, y)
    y += 14
    doc.text(`IBAN: ${perfil.iban}`, 40, y)

    doc.save(`presupuesto-${numero || 'sin-numero'}.pdf`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Presupuesto</h1>
      <form onSubmit={(e: FormEvent) => e.preventDefault()} className="bg-white p-6 rounded shadow space-y-6">
        {/* Fecha, Número, Vencimiento */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">Número</label>
            <input value={numero} onChange={e => setNumero(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">Vencimiento</label>
            <input type="date" value={vencimiento} onChange={e => setVencimiento(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
        </div>

        {/* Tus datos */}
        <fieldset className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Tus datos</h2>
            <input readOnly value={perfil.nombre} placeholder="Nombre" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.apellidos} placeholder="Apellidos" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.telefono} placeholder="Teléfono" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.idioma} placeholder="Idioma" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.nombre_empr} placeholder="Razón Social" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.nif} placeholder="NIF/CIF" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.direccion} placeholder="Dirección" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.ciudad} placeholder="Ciudad" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.provincia} placeholder="Provincia" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.cp} placeholder="CP" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.pais} placeholder="País" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.email} placeholder="Email" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.web} placeholder="Web" className="block w-full mb-2 border rounded px-2 py-1" />
            <input readOnly value={perfil.iban} placeholder="IBAN" className="block w-full mb-2 border rounded px-2 py-1" />
            <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} placeholder="Comentarios" className="block w-full h-24 border rounded px-2 py-1" />
          </div>

          {/* Datos del cliente */}
          <div>
            <h2 className="font-semibold mb-2">Datos del cliente</h2>
            <select
              value={cliente?.id || ''}
              onChange={e => setCliente(clientes.find(c => c.id === e.target.value) || null)}
              className="block w-full mb-4 border rounded px-2 py-1"
            >
              <option value="" disabled>Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {cliente && (
              <>
                <input readOnly value={cliente.direccion} placeholder="Dirección" className="block w-full mb-2 bg-gray-100 border rounded px-2 py-1" />
                <input readOnly value={cliente.cif} placeholder="CIF" className="block w-full mb-2 bg-gray-100 border rounded px-2 py-1" />
                <input readOnly value={cliente.cp} placeholder="CP" className="block w-full mb-2 bg-gray-100 border rounded px-2 py-1" />
                <input readOnly value={cliente.email} placeholder="Email" className="block w-full mb-2 bg-gray-100 border rounded px-2 py-1" />
              </>
            )}
          </div>
        </fieldset>

        {/* Líneas */}
        <fieldset className="space-y-2">
          <legend className="font-semibold">Líneas del presupuesto</legend>
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 items-center">
              <input name="descripcion" placeholder="Descripción" value={l.descripcion} onChange={e => handleLineaChange(i, e)} className="border rounded px-2 py-1" />
              <input name="unidades" type="number" placeholder="Unidades" value={l.unidades} onChange={e => handleLineaChange(i, e)} className="border rounded px-2 py-1" />
              <input name="precioUnitario" type="number" step="0.01" placeholder="Precio unitario" value={l.precioUnitario} onChange={e => handleLineaChange(i, e)} className="border rounded px-2 py-1" />
              <div className="flex items-center">
                <span className="mr-2">{(l.unidades * l.precioUnitario).toFixed(2)} €</span>
                {i === lineas.length - 1 && (
                  <button type="button" onClick={addLinea} className="px-2 py-1 bg-blue-600 text-white rounded">+</button>
                )}
              </div>
            </div>
          ))}
        </fieldset>

        {/* IVA / IRPF */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input type="number" value={iva} onChange={e => setIva(Number(e.target.value))} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input type="number" value={irpf} onChange={e => setIrpf(Number(e.target.value))} className="mt-1 block w-full border rounded px-2 py-1" />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Exportar CSV</button>
          <button type="button" onClick={exportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Descargar PDF</button>
        </div>
      </form>
    </div>
  )
}
