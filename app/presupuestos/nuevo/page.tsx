'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { jsPDF } from 'jspdf'

interface Linea {
  descripcion: string
  unidades: number
  precioUnitario: number
}

interface Empresa {
  nombre: string
  apellidos: string
  telefono: string
  idioma: string
  razonSocial: string
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

interface Cliente {
  nombre: string
  direccion: string
  cif: string
  cp: string
  email: string
}

export default function NuevoPresupuestoPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()

  // Fechas y número
  const [fecha, setFecha] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimiento, setVencimiento] = useState('')

  // Datos del remitente (perfil) + IBAN + Comentarios
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '',
    apellidos: '',
    telefono: '',
    idioma: 'Español',
    razonSocial: '',
    nif: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    cp: '',
    pais: 'España',
    email: '',
    web: '',
    iban: '',
  })
  const [comentarios, setComentarios] = useState('')

  // Datos del cliente
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    direccion: '',
    cif: '',
    cp: '',
    email: '',
  })

  // Líneas, IVA, IRPF
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: '', unidades: 1, precioUnitario: 0 },
  ])
  const [iva, setIva] = useState(21)
  const [irpf, setIrpf] = useState(0)

  // Carga inicial de perfil
  useEffect(() => {
    if (!session) return
    ;(async () => {
      const { data: perfil, error } = await supabase
        .from('perfil')
        .select(`
          nombre, apellidos, telefono, idioma,
          razonSocial, nif, direccion, ciudad,
          provincia, cp, pais, email, web, iban
        `)
        .eq('id', session.user.id)
        .single()

      if (perfil && !error) {
        setEmpresa(perfil as Empresa)
      }
    })()
  }, [session, supabase])

  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLineas((ls) =>
      ls.map((l, idx) =>
        idx === i
          ? { ...l, [name]: name === 'descripcion' ? value : Number(value) }
          : l
      )
    )
  }
  const addLinea = () =>
    setLineas((ls) => [...ls, { descripcion: '', unidades: 1, precioUnitario: 0 }])

  const calcularTotales = () => {
    const base = lineas.reduce((s, l) => s + l.unidades * l.precioUnitario, 0)
    const ivaImp = (base * iva) / 100
    const irpfImp = (base * irpf) / 100
    return { base, ivaImp, irpfImp, total: base + ivaImp - irpfImp }
  }

  const exportCSV = () => {
    const { base, ivaImp, irpfImp, total } = calcularTotales()
    const header = [
      'Fecha',
      'Número',
      'Vencimiento',
      'Empresa',
      'Cliente',
      'Descripción',
      'Unidades',
      'Precio Unitario',
      'Importe',
      'Comentarios',
    ]
    const rows = lineas.map((l) => [
      fecha,
      numero,
      vencimiento,
      empresa.razonSocial || `${empresa.nombre} ${empresa.apellidos}`,
      cliente.nombre,
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
      comentarios,
    ])
    rows.push([
      '',
      '',
      '',
      '',
      '',
      'BASE IMPONIBLE',
      '',
      '',
      base.toFixed(2),
      '',
    ])
    rows.push([
      '',
      '',
      '',
      '',
      '',
      `IVA (${iva}%)`,
      '',
      '',
      ivaImp.toFixed(2),
      '',
    ])
    rows.push([
      '',
      '',
      '',
      '',
      '',
      `IRPF (${irpf}%)`,
      '',
      '',
      (-irpfImp).toFixed(2),
      '',
    ])
    rows.push([
      '',
      '',
      '',
      '',
      '',
      'TOTAL',
      '',
      '',
      total.toFixed(2),
      '',
    ])

    const csv =
      [header, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\r\n') +
      `\r\n\r\nComentarios: ${comentarios}\r\n` +
      `Pago por transferencia (IBAN): ${empresa.iban}`

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

    // Título
    doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(0, 102, 204)
    doc.text('Presupuesto', 40, y)
    y += 30

    // Fechas/número
    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(0)
    doc.text(`Fecha: ${fecha}`, 40, y)
    doc.text(`Núm.: ${numero}`, 300, y)
    y += 16
    doc.text(`Vto.: ${vencimiento}`, 40, y)
    y += 30

    // Nombre de la empresa (sin "DECLARANDO:")
    doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(0, 102, 204)
    const empresaTitulo = empresa.razonSocial || `${empresa.nombre} ${empresa.apellidos}`
    doc.text(empresaTitulo, 40, y)
    doc.text(cliente.nombre || 'Cliente', 300, y)
    y += 20

    // Detalle empresa / cliente
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60)
    doc.text(`NIF: ${empresa.nif}`, 40, y)
    doc.text(`Email: ${empresa.email}`, 300, y)
    y += 14
    doc.text(`Dir.: ${empresa.direccion}`, 40, y)
    doc.text(`CP/Ciudad: ${empresa.cp} / ${empresa.ciudad}`, 300, y)
    y += 14
    doc.text(`Tel.: ${empresa.telefono}`, 40, y)
    doc.text(`IBAN: ${empresa.iban}`, 300, y)
    y += 30

    // Líneas
    doc
      .setFont('helvetica', 'bold')
      .setFontSize(12)
      .setTextColor(0, 102, 204); 
    ['Descripción', 'Unidades', 'P.Unit. (€)', 'Importe (€)'].forEach((h, i) =>
      doc.text(h, 40 + i * 130, y)
    ); 
    y += 16
    doc.setLineWidth(0.5).line(40, y, 550, y)
    y += 10

    doc.setFont('helvetica', 'normal').setTextColor(0)
    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y)
      doc.text(String(l.unidades), 170, y, { align: 'right' })
      doc.text(l.precioUnitario.toFixed(2), 300, y, { align: 'right' })
      doc.text((l.unidades * l.precioUnitario).toFixed(2), 430, y, {
        align: 'right',
      })
      y += 18
      if (y > 750) {
        doc.addPage()
        y = 40
      }
    })

    // Totales
    const { base, ivaImp, irpfImp, total } = calcularTotales()
    y += 20
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0, 102, 204)
    doc.text('BASE:', 300, y)
    doc.text(`${base.toFixed(2)} €`, 550, y, { align: 'right' })
    y += 16
    doc.text(`IVA (${iva}%):`, 300, y)
    doc.text(`${ivaImp.toFixed(2)} €`, 550, y, { align: 'right' })
    y += 16
    doc.text(`IRPF (${irpf}%):`, 300, y)
    doc.text(`${(-irpfImp).toFixed(2)} €`, 550, y, { align: 'right' })
    y += 16
    doc.setFontSize(16).setTextColor(0)
    doc.text('TOTAL:', 300, y)
    doc.text(`${total.toFixed(2)} €`, 550, y, { align: 'right' })
    y += 30

    // Comentarios e IBAN pie
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60)
    doc.text(`Comentarios: ${comentarios}`, 40, y)
    y += 14
    doc.text(`Pago por transferencia (IBAN): ${empresa.iban}`, 40, y)

    doc.save(`presupuesto-${numero || 'sin-numero'}.pdf`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/presupuestos')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Presupuesto</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
        {/* Fechas y número */}
        <div className="grid grid-cols-3 gap-4">
          {/* ... como antes ... */}
        </div>

        {/* Tus datos */}
        <fieldset className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Tus datos</h2>
            {/** Nombre y apellidos **/}
            <input
              placeholder="Nombre"
              value={empresa.nombre}
              onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="Apellidos"
              value={empresa.apellidos}
              onChange={(e) => setEmpresa({ ...empresa, apellidos: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            {/** Resto de campos idénticos **/}
            {/* ... razonSocial, nif, direccion, ciudad, provincia, cp, pais, telefono, email, web, iban */}
          </div>
          {/* Datos del cliente, líneas, IVA/IRPF, comentarios */}
          <textarea
            placeholder="Comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full border rounded px-2 py-1 h-24"
          />
        </fieldset>

        {/* Botones Export */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Descargar PDF
          </button>
        </div>
      </form>
    </div>
  )
}
