'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function NuevoClientePage() {
  const supabase = createPagesBrowserClient()
  const router = useRouter()

  // Estados para cada campo del formulario:
  const [nombreContacto, setNombreContacto] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [nif, setNif] = useState('')
  const [email, setEmail] = useState('')
  const [domicilio, setDomicilio] = useState('')
  const [cp, setCp] = useState('')
  const [localidad, setLocalidad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [pais, setPais] = useState('España')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1) Comprueba usuario logueado
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error(userErr?.message || 'Usuario no encontrado')

      // 2) Inserta nuevo cliente
      const { error: insertErr } = await supabase
        .from('clientes')
        .insert({
          user_id: user.id,
          nombre_contacto: nombreContacto,
          razon_social: razonSocial,
          nif,
          email,
          domicilio,
          cp,
          localidad,
          provincia,
          pais,
          telefono,
        })

      if (insertErr) throw insertErr

      // 3) Redirige al listado de clientes (cierra el “formulario”)
      router.push('/clientes')
    } catch (err: any) {
      alert(`Ha ocurrido un error inesperado:\n${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Nuevo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nombre contacto</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={nombreContacto}
            onChange={e => setNombreContacto(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Razón social</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={razonSocial}
            onChange={e => setRazonSocial(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">NIF / CIF</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={nif}
            onChange={e => setNif(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Domicilio</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={domicilio}
            onChange={e => setDomicilio(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Código postal</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={cp}
              onChange={e => setCp(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Localidad</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={localidad}
              onChange={e => setLocalidad(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Provincia</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium">País</label>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              value={pais}
              onChange={e => setPais(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Teléfono</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full py-2 rounded text-white font-medium ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creando...' : '+ Crear cliente'}
        </button>
      </form>
    </div>
  )
}
