'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function NuevoClientePage() {
  const supabase = useSupabaseClient()
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
      // obtenemos la sesión
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        alert('Tienes que iniciar sesión')
        router.push('/auth/login')
        return
      }

      // insertamos/upsert en tabla "clientes"
      const { error } = await supabase
        .from('clientes')
        .upsert({
          user_id: session.user.id,
          nombre,
          razon_social,
          nif,
          email,
          domicilio,
          codigo_postal,   // <–– aquí ya coincide con tu columna
          localidad,
          provincia,
          pais,
          telefono,
        })

      if (error) throw error

      // si todo OK, volvemos al listado
      router.push('/clientes')
    } catch (err: any) {
      alert('Ha ocurrido un error inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre contacto</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Razón social</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={razon_social}
            onChange={e => setRazonSocial(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">NIF / CIF</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={nif}
            onChange={e => setNif(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Domicilio</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={domicilio}
            onChange={e => setDomicilio(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Código postal</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={codigo_postal}
              onChange={e => setCodigoPostal(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Localidad</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={localidad}
              onChange={e => setLocalidad(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Provincia</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">País</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={pais}
              onChange={e => setPais(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Teléfono</label>
          <input
            type="tel"
            className="w-full border px-3 py-2 rounded"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creando…' : '+ Crear cliente'}
        </button>
      </form>
    </div>
  )
}
