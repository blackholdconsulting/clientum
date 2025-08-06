'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
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

  // fechas y número
  const [fecha, setFecha] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimiento, setVencimiento] = useState('')

  // datos remitente (perfil) + IBAN
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

  // datos del cliente
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    direccion: '',
    cif: '',
    cp: '',
    email: '',
  })

  // líneas, IVA, IRPF
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: '', unidades: 1, precioUnitario: 0 },
  ])
  const [iva, setIva] = useState(21)
  const [irpf, setIrpf] = useState(0)
  const [loading, setLoading] = useState(false)

  // al montar, cargo datos de perfil
  useEffect(() => {
    if (!session) return
    ;(async () => {
      const { data: perfil, error } = await supabase
        .from('perfil')
        .select(`
          nombre, apellidos, telefono, idioma,
          razonSocial, nif, direccion,
          ciudad, provincia, cp, pais,
          email, web, iban
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
          ? {
              ...l,
              [name]: name === 'descripcion' ? value : Number(value),
            }
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
      'Remitente',
      'Cliente',
      'Descripción',
      'Unidades',
      'Precio Unitario',
      'Importe',
    ]
    const rows = lineas.map((l) => [
      fecha,
      numero,
      vencimiento,
      empresa.razonSocial,
      cliente.nombre,
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ])
    rows.push(['', '', '', '', '', 'BASE IMPONIBLE', '', '', base.toFixed(2)])
    rows.push(['', '', '', '', '', `IVA (${iva}%)`, '', '', ivaImp.toFixed(2)])
    rows.push(['', '', '', '', '', `IRPF (${irpf}%)`, '', '', (-irpfImp).toFixed(2)])
    rows.push(['', '', '', '', '', 'TOTAL', '', '', total.toFixed(2)])

    const csv =
      [header, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\r\n') +
      `\r\n\r\nCondiciones de pago: 30 días a partir de la fecha de entrega de los artículos.\r\n` +
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
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(0, 102, 204)
    doc.text('Presupuesto', 40, y)
    y += 30

    // Fechas y número
    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(0, 0, 0)
    doc.text(`Fecha: ${fecha}`, 40, y)
    y += 16
    doc.text(`Núm.: ${numero}`, 40, y)
    y += 16
    doc.text(`Vto.: ${vencimiento}`, 40, y)
    y += 30

    // DECLARANDO: razón social
    doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(0, 102, 204)
    doc.text(`DECLARANDO: ${empresa.razonSocial}`, 40, y)
    doc.text(cliente.nombre || 'Cliente', 300, y)
    y += 20

    // Datos detallados
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60, 60, 60)
    // Remitente
    doc.text(`NIF: ${empresa.nif}`, 40, y)
    doc.text(`Email: ${empresa.email}`, 300, y)
    y += 14
    doc.text(`Dir.: ${empresa.direccion}`, 40, y)
    doc.text(`CP/Ciudad: ${empresa.cp} / ${empresa.ciudad}`, 300, y)
    y += 14
    doc.text(`Teléfono: ${empresa.telefono}`, 40, y)
    doc.text(`IBAN: ${empresa.iban}`, 300, y)
    y += 30

    // Tabla de líneas...
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0, 102, 204)
    const cols = ['Descripción', 'Unidades', 'P. Unit. (€)', 'Importe (€)']
    cols.forEach((h, i) => doc.text(h, 40 + i * 130, y))
    y += 16
    doc.setLineWidth(0.5).line(40, y, 550, y)
    y += 10

    doc.setFont('helvetica', 'normal').setTextColor(0, 0, 0)
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
    doc.text(base.toFixed(2) + ' €', 550, y, { align: 'right' })
    y += 16
    doc.text(`IVA (${iva}%):`, 300, y)
    doc.text(ivaImp.toFixed(2) + ' €', 550, y, { align: 'right' })
    y += 16
    doc.text(`IRPF (${irpf}%):`, 300, y)
    doc.text((-irpfImp).toFixed(2) + ' €', 550, y, { align: 'right' })
    y += 16

    doc.setFontSize(16).setTextColor(0, 0, 0)
    doc.text('TOTAL:', 300, y)
    doc.text(total.toFixed(2) + ' €', 550, y, { align: 'right' })
    y += 30

    // Condiciones y cuenta
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60, 60, 60)
    doc.text(
      'Condiciones de pago: 30 días a partir de la entrega de los artículos.',
      40,
      y
    )
    y += 14
    doc.text(`Transferencia (IBAN): ${empresa.iban}`, 40, y)

    // guardar
    doc.save(`presupuesto-${numero || 'sin-numero'}.pdf`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // aquí podrías guardar en Supabase si quieres...
    router.push('/presupuestos')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Presupuesto</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-6"
      >
        {/* fechas, remitente (ya cargado), cliente, líneas, IVA/IRPF... */}
        {/* --- (idéntico al form que ya tenías) --- */}
        {/* Botones de export */}
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
