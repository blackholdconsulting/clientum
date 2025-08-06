// app/presupuestos/page.tsx
'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { jsPDF } from 'jspdf'

interface Linea { descripcion: string; unidades: number; precioUnitario: number }
interface Empresa {
  nombre: string
  telefono: string
  razonSocial: string
  nif: string
  direccion: string
  ciudad: string
  cp: string
  email: string
  iban: string
}
interface Cliente { nombre: string; direccion: string; cif: string; cp: string; email: string }

export default function PresupuestosPage() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()

  // Estados de formulario
  const [fecha,     setFecha]     = useState('')
  const [numero,    setNumero]    = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [comentarios, setComentarios] = useState('')

  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '', telefono: '', razonSocial: '', nif: '',
    direccion: '', ciudad: '', cp: '', email: '', iban: '',
  })

  const [cliente, setCliente] = useState<Cliente>({
    nombre: '', direccion: '', cif: '', cp: '', email: '',
  })

  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: '', unidades: 1, precioUnitario: 0 }])
  const [iva, setIva] = useState(21)
  const [irpf, setIrpf] = useState(0)

  // Al montar, cargo perfil
  useEffect(() => {
    if (!session) return
    ;(async () => {
      const { data: perfil } = await supabase
        .from('perfil')
        .select(`nombre,telefono,razonSocial,nif,direccion,ciudad,cp,email,iban`)
        .eq('id', session.user.id)
        .single()
      if (perfil) setEmpresa(perfil as Empresa)
    })()
  }, [session, supabase])

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
  const addLinea = () =>
    setLineas((l) => [...l, { descripcion: '', unidades: 1, precioUnitario: 0 }])

  const calcularTotales = () => {
    const base = lineas.reduce((s, l) => s + l.unidades * l.precioUnitario, 0)
    const ivaImp = (base * iva) / 100
    const irpfImp = (base * irpf) / 100
    return { base, ivaImp, irpfImp, total: base + ivaImp - irpfImp }
  }

  // ... exportCSV y exportPDF idénticos, usando empresa.nombre, empresa.telefono, etc.

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Presupuesto</h1>
      <form onSubmit={e => e.preventDefault()} className="bg-white p-6 rounded shadow space-y-6">
        {/* Fechas, número */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label className="block text-sm">Número</label>
            <input value={numero} onChange={e => setNumero(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label className="block text-sm">Vencimiento</label>
            <input type="date" value={vencimiento} onChange={e => setVencimiento(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"/>
          </div>
        </div>

        {/* Tus datos */}
        <fieldset className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Tus datos</h2>
            <input placeholder="Nombre" value={empresa.nombre}
              onChange={e => setEmpresa({ ...empresa, nombre: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="Teléfono" value={empresa.telefono}
              onChange={e => setEmpresa({ ...empresa, telefono: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="Razón Social" value={empresa.razonSocial}
              onChange={e => setEmpresa({ ...empresa, razonSocial: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="NIF" value={empresa.nif}
              onChange={e => setEmpresa({ ...empresa, nif: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="Dirección fiscal" value={empresa.direccion}
              onChange={e => setEmpresa({ ...empresa, direccion: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="Ciudad" value={empresa.ciudad}
              onChange={e => setEmpresa({ ...empresa, ciudad: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="CP" value={empresa.cp}
              onChange={e => setEmpresa({ ...empresa, cp: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="Email" value={empresa.email}
              onChange={e => setEmpresa({ ...empresa, email: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <input placeholder="IBAN" value={empresa.iban}
              onChange={e => setEmpresa({ ...empresa, iban: e.target.value })}
              className="block w-full border rounded px-2 py-1 mb-2"/>
            <textarea placeholder="Comentarios" value={comentarios}
              onChange={e => setComentarios(e.target.value)}
              className="block w-full border rounded px-2 py-1 h-24"/>
          </div>

          {/* Datos del cliente y líneas */}
          <div className="space-y-4">
            {/* ... */}
          </div>
        </fieldset>

        {/* Botones de export */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded">Exportar CSV</button>
          <button type="button" onClick={exportPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded">Descargar PDF</button>
        </div>
      </form>
    </div>
  )
}
