'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

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
  const supabase = createPagesBrowserClient()
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

      if (!session) throw new Error('Debes iniciar sesión')

      const upsertData: ClienteInsert = {
        user_id: session.user.id,
        nombre,
        razon_social,
        nif,
        email,
        domicilio,
        codigo_postal,
        localidad,
        provincia,
        pais,
        telefono,
      }

      const { error } = await supabase.from('clientes').upsert(upsertData)
      if (error) throw error

      router.push('/clientes')
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
        {[
          { label: 'Nombre contacto', value: nombre, onChange: setNombre },
          { label: 'Razón social', value: razon_social, onChange: setRazonSocial },
          { label: 'NIF / CIF', value: nif, onChange: setNif },
          { label: 'Email', value: email, onChange: setEmail, type: 'email' },
          { label: 'Domicilio', value: domicilio, onChange: setDomicilio },
          { label: 'Código postal', value: codigo_postal, onChange: setCodigoPostal },
          { label: 'Localidad', value: localidad, onChange: setLocalidad },
          { label: 'Provincia', value: provincia, onChange: setProvincia },
          { label: 'País', value: pais, onChange: setPais },
          { label: 'Teléfono', value: telefono, onChange: setTelefono },
        ].map(({ label, value, onChange, type }, i) => (
          <div key={i}>
            <label className="block mb-1">{label}</label>
            <input
              type={type || 'text'}
              value={value}
              onChange={e => onChange(e.target.value)}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Creando…' : '+ Crear cliente'}
        </button>
      </form>
    </div>
  )
}
