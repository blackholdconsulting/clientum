// app/presupuestos/page.tsx
'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
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
type Cliente = {
  id: string
  nombre: string
  direccion: string
  cif: string
  cp: string
  email: string
}

export default function PresupuestosPage() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)

  const [fecha, setFecha] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: '', unidades: 1, precioUnitario: 0 },
  ])
  const [iva, setIva] = useState(21)
  const [irpf, setIrpf] = useState(0)

  // cargar datos de perfil y clientes
  useEffect(() => {
    if (session === null) return
    if (!session) {
      router.push('/login')
      return
    }
    ;(async () => {
      const { data: p, error: errP } = await supabase
        .from('perfil')
        .select(
          `nombre,apellidos,telefono,idioma,
           nombre_empr,nif,direccion,ciudad,provincia,cp,pais,
           email,web,iban`
        )
        .eq('id', session.user.id)
        .single()
      if (errP) console.error(errP)
      else setPerfil(p)

      const { data: c, error: errC } = await supabase
        .from('clientes')
        .select('id,nombre,direccion,cif,cp,email')
        .order('nombre', { ascending: true })
      if (errC) console.error(errC)
      else setClientes(c)
    })()
  }, [session, supabase, router])

  if (!perfil) {
    return <div className="p-6">Cargando datos de tu perfil…</div>
  }

  const addLinea = () =>
    setLineas((l) => [...l, { descripcion: '', unidades: 1, precioUnitario: 0 }])

  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLineas((l) =>
      l.map((ln, idx) =>
        idx === i
          ? { ...ln, [name]: name === 'descripcion' ? value : Number(value) }
          : ln
      )
    )
  }

  const calcularTotales = () => {
    const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0)
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
      'P.Unit',
      'Importe',
      'Comentarios',
      'IBAN',
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
      perfil.iban,
    ])
    rows.push(['', '', '', '', '', 'BASE', '', '', base.toFixed(2), '', ''])
    rows.push(['', '', '', '', '', `IVA(${iva}%)`, '', '', ivaImp.toFixed(2), '', ''])
    rows.push(['', '', '', '', '', `IRPF(${irpf}%)`, '', '', (-irpfImp).toFixed(2), '', ''])
    rows.push(['', '', '', '', '', 'TOTAL', '', '', total.toFixed(2), '', ''])

    const csv =
      [header, ...rows]
        .map((r) => r.map((c) => `"${(c||'').toString().replace(/"/g,'""')}"`).join(','))
        .join('\r\n') + `\r\n\r\nComentarios: ${comentarios}\r\nIBAN: ${perfil.iban}`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `presupuesto-${numero||'sin-numero'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40
    doc.setFont('helvetica','bold').setFontSize(24).setTextColor(0,102,204)
    doc.text('Presupuesto',40,y); y+=30
    doc.setFont('helvetica','normal').setFontSize(12).setTextColor(0)
    doc.text(`Fecha: ${fecha}`,40,y); doc.text(`Núm.: ${numero}`,300,y); y+=16
    doc.text(`Vto.: ${vencimiento}`,40,y); y+=30
    doc.setFont('helvetica','bold').setFontSize(14).setTextColor(0,102,204)
    doc.text(perfil.nombre_empr,40,y); doc.text(cliente?.nombre||'Cliente',300,y); y+=20
    doc.setFont('helvetica','normal').setFontSize(10).setTextColor(60)
    doc.text(`Teléfono: ${perfil.telefono}`,40,y); doc.text(`Email: ${perfil.email}`,300,y); y+=14
    doc.text(`Dirección: ${perfil.direccion}`,40,y); doc.text(`Ciudad/CP: ${perfil.ciudad}/${perfil.cp}`,300,y); y+=14
    doc.text(`NIF: ${perfil.nif}`,40,y); doc.text(`IBAN: ${perfil.iban}`,300,y); y+=30
    doc.setFont('helvetica','bold').setFontSize(12).setTextColor(0,102,204)
    ;['Descripción','Unidades','P.Unit (€)','Importe (€)'].forEach((h,i)=>doc.text(h,40+i*130,y))
    y+=16; doc.line(40,y,550,y); y+=10
    doc.setFont('helvetica','normal').setTextColor(0)
    lineas.forEach((l)=>{
      doc.text(l.descripcion,40,y)
      doc.text(String(l.unidades),170,y,{align:'right'})
      doc.text(l.precioUnitario.toFixed(2),300,y,{align:'right'})
      doc.text((l.unidades*l.precioUnitario).toFixed(2),430,y,{align:'right'})
      y+=18; if(y>750){doc.addPage();y=40}
    })
    const { base, ivaImp, irpfImp, total } = calcularTotales()
    y+=20; doc.setFont('helvetica','bold').setFontSize(12).setTextColor(0,102,204)
    doc.text('BASE:',300,y); doc.text(`${base.toFixed(2)} €`,550,y,{align:'right'}); y+=16
    doc.text(`IVA(${iva}%)`,300,y); doc.text(`${ivaImp.toFixed(2)} €`,550,y,{align:'right'}); y+=16
    doc.text(`IRPF(${irpf}%)`,300,y); doc.text(`${(-irpfImp).toFixed(2)} €`,550,y,{align:'right'}); y+=16
    doc.setFontSize(16).setTextColor(0)
    doc.text('TOTAL:',300,y); doc.text(`${total.toFixed(2)} €`,550,y,{align:'right'}); y+=30
    doc.setFont('helvetica','normal').setFontSize(10).setTextColor(60)
    doc.text(`Comentarios: ${comentarios}`,40,y); y+=14
    doc.text(`IBAN: ${perfil.iban}`,40,y)
    doc.save(`presupuesto-${numero||'sin-numero'}.pdf`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Presupuesto</h1>
      <form onSubmit={(e:FormEvent)=>e.preventDefault()} className="bg-white p-6 rounded shadow space-y-6">
        {/* Fecha / Nº / Vto */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Número</label>
            <input value={numero} onChange={e=>setNumero(e.target.value)} className="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Vencimiento</label>
            <input type="date" value={vencimiento} onChange={e=>setVencimiento(e.target.value)} className="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        {/* Tus datos */}
        <fieldset className="grid grid-cols-2 gap-4">
          <div>
            <h2>Tus datos</h2>
            <input readOnly value={perfil.nombre} placeholder="Nombre" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={perfil.apellidos} placeholder="Apellidos" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={perfil.telefono} placeholder="Teléfono" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={perfil.nombre_empr} placeholder="Razón Social" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={perfil.nif} placeholder="NIF/CIF" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={perfil.direccion} placeholder="Dirección" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={`${perfil.ciudad} / ${perfil.cp}`} placeholder="Ciudad / CP" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <input readOnly value={perfil.iban} placeholder="IBAN" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            <textarea value={comentarios} onChange={e=>setComentarios(e.target.value)} placeholder="Comentarios" className="w-full border rounded px-2 py-1 h-24"/>
          </div>

          {/* Datos cliente */}
          <div>
            <h2>Datos del cliente</h2>
            <select value={cliente?.id||''} onChange={e=>setCliente(clientes.find(c=>c.id===e.target.value)||null)} className="w-full border rounded px-2 py-1 mb-4">
              <option value="" disabled>Selecciona un cliente</option>
              {clientes.map(c=>(
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {cliente && <>
              <input readOnly value={cliente.direccion} placeholder="Dirección" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
              <input readOnly value={cliente.cif} placeholder="CIF" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
              <input readOnly value={cliente.email} placeholder="Email" className="w-full border rounded px-2 py-1 mb-2 bg-gray-50"/>
            </>}
          </div>
        </fieldset>

        {/* Líneas */}
        <fieldset className="space-y-2">
          <legend>Líneas del presupuesto</legend>
          {lineas.map((l,i)=>(
            <div key={i} className="grid grid-cols-4 gap-4 items-center">
              <input name="descripcion" placeholder="Descripción" value={l.descripcion} onChange={e=>handleLineaChange(i,e)} className="border rounded px-2 py-1"/>
              <input name="unidades" type="number" placeholder="Unidades" value={l.unidades} onChange={e=>handleLineaChange(i,e)} className="border rounded px-2 py-1"/>
              <input name="precioUnitario" type="number" step="0.01" placeholder="Precio unitario" value={l.precioUnitario} onChange={e=>handleLineaChange(i,e)} className="border rounded px-2 py-1"/>
              <div className="flex items-center">
                <span>{(l.unidades*l.precioUnitario).toFixed(2)} €</span>
                {i===lineas.length-1 && <button type="button" onClick={addLinea} className="ml-2 px-2 py-1 bg-blue-600 text-white rounded">+</button>}
              </div>
            </div>
          ))}
        </fieldset>

        {/* IVA / IRPF */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>IVA (%)</label>
            <input type="number" value={iva} onChange={e=>setIva(Number(e.target.value))} className="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>IRPF (%)</label>
            <input type="number" value={irpf} onChange={e=>setIrpf(Number(e.target.value))} className="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded">Exportar CSV</button>
          <button type="button" onClick={exportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded">Descargar PDF</button>
        </div>
      </form>
    </div>
  )
}
