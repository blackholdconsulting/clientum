'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../../types/supabase' // Ajusta la ruta si tu types está en otro lugar

export default function NuevoClientePage() {
  const supabase = createPagesBrowserClient<Database>()
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [nif, setNif] = useState('')
  const [email, setEmail] = useState('')
  const [domicilio, setDomicilio] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [localidad, setLocalidad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [pais, setPais] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1) Obtener el user_id
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr || !user) {
        throw new Error(userErr?.message || 'No se obtuvo el usuario')
      }

      // 2) Insertar el nuevo cliente
      const { error: insertErr } = await supabase
        .from('clientes')
        .insert({
          user_id: user.id,
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

      if (insertErr) {
        throw insertErr
      }

      // 3) Redirigir al listado de clientes
      router.push('/clientes')
    } catch (err: any) {
      // Mostrar el mensaje real de error
      alert(`Error al crear el cliente:\n${err.message || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Nuevo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nombre contacto</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Razón social</label>
          <input
            type="text"
            value={razonSocial}
            onChange={e => setRazonSocial(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">NIF / CIF</label>
          <input
            type="text"
            value={nif}
            onChange={e => setNif(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Domicilio</label>
          <input
            type="text"
            value={domicilio}
            onChange={e => setDomicilio(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Código postal</label>
            <input
              type="text"
              value={codigoPostal}
              onChange={e => setCodigoPostal(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>
          <div>
            <label className="block font-medium">Localidad</label>
            <input
              type="text"
              value={localidad}
              onChange={e => setLocalidad(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Provincia</label>
            <input
              type="text"
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>
          <div>
            <label className="block font-medium">País</label>
            <input
              type="text"
              value={pais}
              onChange={e => setPais(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-medium py-2 rounded ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creando...' : '+ Crear cliente'}
        </button>
      </form>
    </div>
  )
}
