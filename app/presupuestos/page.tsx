// app/presupuestos/page.tsx
'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { jsPDF } from 'jspdf'

type Linea = { descripcion: string; unidades: number; precioUnitario: number }
type Perfil = { nombre_empr: string; nif: string; direccion: string; ciudad: string; cp: string; email: string; iban: string }
type Cliente = { id: string; nombre: string; direccion: string; cif: string; cp: string; email: string }

export default function PresupuestosPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)

  const [fecha, setFecha] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: '', unidades: 1, precioUnitario: 0 }])
  const [iva, setIva] = useState(21)
  const [irpf, setIrpf] = useState(0)

  useEffect(() => {
    // carga perfil
    fetch('/api/perfil')
      .then(r => r.json())
      .then((p: Perfil) => setPerfil(p))
      .catch(console.error)
    // carga clientes
    fetch('/api/clientes')
      .then(r => r.json())
      .then((c: Cliente[]) => setClientes(c))
      .catch(console.error)
  }, [])

  if (!perfil) return <div className="p-6">Cargando datos de tu perfil…</div>

  const addLinea = () =>
    setLineas(ls => [...ls, { descripcion: '', unidades: 1, precioUnitario: 0 }])

  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLineas(ls =>
      ls.map((l, idx) =>
        idx === i ? ({ ...l, [name]: name === 'descripcion' ? value : Number(value) } as Linea) : l
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
    const header = ['Fecha','Número','Vto','Empresa','Cliente','Desc','Unid','P.Unit','Imp','Com','IBAN']
    const rows = lineas.map(l => [
      fecha, numero, vencimiento,
      perfil.nombre_empr,
      cliente?.nombre||'',
      l.descripcion, l.unidades.toString(), l.precioUnitario.toFixed(2),
      (l.unidades*l.precioUnitario).toFixed(2),
      comentarios, perfil.iban
    ])
    rows.push(['','','','','','BASE','','',base.toFixed(2),'', ''])
    rows.push(['','','','','',`IVA(${iva}%)`,'','',ivaImp.toFixed(2),'',''])
    rows.push(['','','','','',`IRPF(${irpf}%)`,'','',(-irpfImp).toFixed(2),'',''])
    rows.push(['','','','','','TOTAL','','',total.toFixed(2),'',''])
    const csv = [header, ...rows].map(r=>r.map(c=>`"${c.replace(/"/g,'""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
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
    doc.setFontSize(24).text('Presupuesto', 40, y); y+=30
    doc.setFontSize(12).text(`Fecha: ${fecha}`, 40, y); doc.text(`Núm.: ${numero}`, 300, y); y+=16
    doc.text(`Vto.: ${vencimiento}`, 40, y); y+=30
    doc.setFontSize(14).text(perfil.nombre_empr, 40, y); doc.text(cliente?.nombre||'Cliente', 300, y); y+=20
    doc.setFontSize(10)
    doc.text(`Teléfono: ${perfil.telefono}`, 40, y); doc.text(`Email: ${perfil.email}`, 300, y); y+=14
    doc.text(`Dirección: ${perfil.direccion}`, 40, y); doc.text(`Ciudad/CP: ${perfil.ciudad}/${perfil.cp}`, 300, y); y+=14
    doc.text(`NIF: ${perfil.nif}`, 40, y); doc.text(`IBAN: ${perfil.iban}`, 300, y); y+=30
    doc.setFontSize(12)
    ;['Desc','Unid','P.Unit','Imp'].forEach((h,i)=>doc.text(h, 40+i*130, y))
    y+=16; doc.line(40, y, 550, y); y+=10
    lineas.forEach(l=>{
      doc.text(l.descripcion,40,y)
      doc.text(String(l.unidades),170,y,{align:'right'})
      doc.text(l.precioUnitario.toFixed(2),300,y,{align:'right'})
      doc.text((l.unidades*l.precioUnitario).toFixed(2),430,y,{align:'right'})
      y+=18; if(y>750){doc.addPage();y=40}
    })
    const { base, ivaImp, irpfImp, total }=calcularTotales()
    y+=20; doc.text('BASE:',300,y); doc.text(`${base.toFixed(2)} €`,550,y,{align:'right'}); y+=16
    doc.text(`IVA(${iva}%)`,300,y); doc.text(`${ivaImp.toFixed(2)} €`,550,y,{align:'right'}); y+=16
    doc.text(`IRPF(${irpf}%)`,300,y); doc.text(`${(-irpfImp).toFixed(2)} €`,550,y,{align:'right'}); y+=16
    doc.setFontSize(16).text('TOTAL:',300,y); doc.text(`${total.toFixed(2)} €`,550,y,{align:'right'}); y+=30
    doc.setFontSize(10).text(`Comentarios: ${comentarios}`,40,y); y+=14
    doc.text(`IBAN: ${perfil.iban}`,40,y)
    doc.save(`presupuesto-${numero||'sin-numero'}.pdf`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Presupuesto</h1>
      <form onSubmit={(e:FormEvent)=>e.preventDefault()} className="bg-white p-6 rounded shadow space-y-6">
        {/* ... mismo formulario de antes ... */}
        {/* Copia tal cual el JSX del formulario que ya tenías */}
        {/* Asegúrate de que las funciones exportCSV y exportPDF cierren bien */}
      </form>
    </div>
  )
}
