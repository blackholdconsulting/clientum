'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../../types/supabase'

type ClienteInsert = {
  user_id: string
  nombre: string
  razon_social: string
  nif: string
  email: string
  domicilio: string
  codigo_postal: string
  localidad: string
  provincia: string
  pais: string
  telefono: string
}

export default function NuevoClientePage() {
  const supabase = createPagesBrowserClient<Database>()
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [razon_social, setRazonSocial] = useState('')
  const [nif, setNif] = useState('')
  const [email, setEmail] = useState('')
  const [domicilio, setDomicilio] = useState('')
  const [codigo_postal, setCodigoPostal] = useState('')
  const [localidad, setLocalidad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [pais, setPais] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error('Tienes que iniciar sesión')

      const upsertData: ClienteInsert = {
        user_id: session.user.id,
        nombre,
        razon_social,
        nif,
        email,
        domicilio,
        codigo_postal,    // <-- cambiamos cp por codigo_postal
        localidad,
        provincia,
        pais,
        telefono,
      }

      const { error } = await supabase.from('clientes').upsert(upsertData)
      if (error) throw error

      router.push('/clientes') // volvemos al listado
    } catch (err: any) {
      alert('Ha ocurrido un error inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4">Nuevo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nombre contacto</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>Razón social</label>
          <input value={razon_social} onChange={e => setRazonSocial(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>NIF / CIF</label>
          <input value={nif} onChange={e => setNif(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>Domicilio</label>
          <input value={domicilio} onChange={e => setDomicilio(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>Código postal</label>
          <input
            value={codigo_postal}
            onChange={e => setCodigoPostal(e.target.value)}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Localidad</label>
          <input value={localidad} onChange={e => setLocalidad(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>Provincia</label>
          <input value={provincia} onChange={e => setProvincia(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>País</label>
          <input value={pais} onChange={e => setPais(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label>Teléfono</label>
          <input value={telefono} onChange={e => setTelefono(e.target.value)} required className="w-full border px-2 py-1 rounded" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? 'Creando…' : '+ Crear cliente'}
        </button>
      </form>
    </div>
  )
}
