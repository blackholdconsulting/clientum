// app/presupuestos/nuevo/page.tsx
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

  // Fechas y número
  const [fecha, setFecha] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimiento, setVencimiento] = useState('')

  // Datos del remitente (perfil) + IBAN
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

  // Al montar, cargo los datos de perfil
  useEffect(() => {
    if (!session) return
    ;(async () => {
      const { data: perfil, error } = await supabase
        .from('perfil')
        .select(
          `nombre, apellidos, telefono, idioma,
           razonSocial, nif, direccion, ciudad,
           provincia, cp, pais, email, web, iban`
        )
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
    const { base, ivaImp, irpfImp } = calcularTotales()
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
    rows.push(['', '', '', '', '', 'TOTAL', '', '', (base + ivaImp - irpfImp).toFixed(2)])

    const csv =
      [header, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
        .join('\r\n') +
      `\r\n\r\nCondiciones de pago: 30 días a partir de la entrega.\r\n` +
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

    // --- Cabecera PDF ---
    doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(0, 102, 204)
    doc.text('Presupuesto', 40, y)
    y += 30

    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(0)
    doc.text(`Fecha: ${fecha}`, 40, y)
    doc.text(`Núm.: ${numero}`, 300, y)
    y += 16
    doc.text(`Vto.: ${vencimiento}`, 40, y)
    y += 30

    // DECLARANDO: razón social + cliente
    doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(0, 102, 204)
    doc.text(`DECLARANDO: ${empresa.razonSocial}`, 40, y)
    doc.text(cliente.nombre || 'Cliente', 300, y)
    y += 20

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

    // Tabla de líneas
    doc
      .setFont('helvetica', 'bold')
      .setFontSize(12)
      .setTextColor(0, 102, 204);  // <-- punto y coma añadido aquí
    ['Descripción', 'Unidades', 'P.Unit. (€)', 'Importe (€)'].forEach((h, i) =>
      doc.text(h, 40 + i * 130, y)
    );  // <-- punto y coma al final de forEach
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

    // Pie con condiciones e IBAN
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60)
    doc.text(
      'Condiciones de pago: 30 días a partir de la entrega de los artículos.',
      40,
      y
    )
    y += 14
    doc.text(`Transferencia (IBAN): ${empresa.iban}`, 40, y)

    doc.save(`presupuesto-${numero || 'sin-numero'}.pdf`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/presupuestos')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Presupuesto</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-6"
      >
        {/* Fechas y número */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Número</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Tus datos */}
        <fieldset className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Tus datos</h2>
            <input
              placeholder="Razón Social"
              value={empresa.razonSocial}
              onChange={(e) =>
                setEmpresa({ ...empresa, razonSocial: e.target.value })
              }
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="NIF"
              value={empresa.nif}
              onChange={(e) => setEmpresa({ ...empresa, nif: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="Dirección"
              value={empresa.direccion}
              onChange={(e) =>
                setEmpresa({ ...empresa, direccion: e.target.value })
              }
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="CP y Ciudad"
              value={`${empresa.cp} ${empresa.ciudad}`}
              onChange={(e) => {
                const [cp, ...ciudad] = e.target.value.split(' ')
                setEmpresa({ ...empresa, cp, ciudad: ciudad.join(' ') })
              }}
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="Email"
              value={empresa.email}
              onChange={(e) =>
                setEmpresa({ ...empresa, email: e.target.value })
              }
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="IBAN"
              value={empresa.iban}
              onChange={(e) =>
                setEmpresa({ ...empresa, iban: e.target.value })
              }
              className="block w-full border rounded px-2 py-1"
            />
          </div>

          {/* Datos del cliente */}
          <div>
            <h2 className="font-semibold mb-2">Datos del cliente</h2>
            <input
              placeholder="Nombre / Razón Social"
              value={cliente.nombre}
              onChange={(e) =>
                setCliente({ ...cliente, nombre: e.target.value })
              }
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="Dirección"
              value={cliente.direccion}
              onChange={(e) =>
                setCliente({ ...cliente, direccion: e.target.value })
              }
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="CIF"
              value={cliente.cif}
              onChange={(e) => setCliente({ ...cliente, cif: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="CP y Ciudad"
              value={cliente.cp}
              onChange={(e) =>
                setCliente({ ...cliente, cp: e.target.value })
              }
              className="block w-full border rounded px-2 py-1 mb-2"
            />
            <input
              placeholder="Email"
              value={cliente.email}
              onChange={(e) =>
                setCliente({ ...cliente, email: e.target.value })
              }
              className="block w-full border rounded px-2 py-1"
            />
          </div>
        </fieldset>

        {/* Líneas */}
        <fieldset className="space-y-2">
          <legend className="font-semibold">Líneas del presupuesto</legend>
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 items-center">
              <input
                name="descripcion"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                name="unidades"
                placeholder="Unidades"
                value={l.unidades}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                name="precioUnitario"
                placeholder="Precio unitario"
                step="0.01"
                value={l.precioUnitario}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-2 py-1"
              />
              <div className="flex items-center">
                <span className="mr-2">
                  {(l.unidades * l.precioUnitario).toFixed(2)} €
                </span>
                {i === lineas.length - 1 && (
                  <button
                    type="button"
                    onClick={addLinea}
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </fieldset>

        {/* IVA / IRPF */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              value={iva}
              onChange={(e) => setIva(Number(e.target.value))}
              className="
border rounded px-2 py-1 mt-1 block w-full"
            />
          </div>
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input
              type="number"
              value={irpf}
              onChange={(e) => setIrpf(Number(e.target.value))}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Descargar PDF
          </button>
        </div>
      </form>
    </div>
  )
}
