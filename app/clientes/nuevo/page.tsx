'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [nombre, setNombre] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [nif, setNif] = useState('')
  const [email, setEmail] = useState('')
  const [domicilio, setDomicilio] = useState('')
  const [codigoPostal, setCodigoPostal] = useState<number | ''>('')
  const [localidad, setLocalidad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [pais, setPais] = useState('')
  const [telefono, setTelefono] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1) obtener sesión para user_id
      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession()

      if (sessErr || !session?.user) {
        alert('Tu sesión ha caducado. Por favor, vuelve a iniciar sesión.')
        router.push('/auth/login')
        return
      }

      // 2) insertar
      const { error } = await supabase
        .from('clientes')
        .insert({
          user_id: session.user.id,
          nombre,
          razon_social: razonSocial || null,
          nif: nif || null,
          email: email || null,
          domicilio: domicilio || null,
          codigo_postal: codigoPostal === '' ? null : codigoPostal,
          localidad: localidad || null,
          provincia: provincia || null,
          pais: pais || null,
          telefono: telefono === '' ? null : telefono,
        })

      if (error) {
        alert('Error creando cliente:\n' + error.message)
        return
      }

      // 3) al éxito, navegar y recargar lista
      router.push('/clientes')
    } catch (err: any) {
      console.error(err)
      alert('Ha ocurrido un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Nuevo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Nombre contacto *
          <input
            type="text"
            required
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block">
          Razón social
          <input
            type="text"
            value={razonSocial}
            onChange={e => setRazonSocial(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block">
          NIF / CIF
          <input
            type="text"
            value={nif}
            onChange={e => setNif(e.target.value.toUpperCase())}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <label className="block">
          Domicilio
          <input
            type="text"
            value={domicilio}
            onChange={e => setDomicilio(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            Código postal
            <input
              type="number"
              value={codigoPostal}
              onChange={e =>
                setCodigoPostal(e.target.value === '' ? '' : parseInt(e.target.value))
              }
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            Localidad
            <input
              type="text"
              value={localidad}
              onChange={e => setLocalidad(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            Provincia
            <input
              type="text"
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            País
            <input
              type="text"
              value={pais}
              onChange={e => setPais(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
        </div>
        <label className="block">
          Teléfono
          <input
            type="number"
            value={telefono}
            onChange={e =>
              setTelefono(e.target.value === '' ? '' : parseInt(e.target.value))
            }
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creando…' : '+ Crear cliente'}
        </button>
      </form>
    </main>
  )
}
