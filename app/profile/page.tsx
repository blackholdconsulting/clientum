'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

type Perfil = {
  id: string
  user_id: string
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
  firma: string | null
  updated_at: string
  pwd: string | null
}

export default function ProfilePage() {
  const supabase = createPagesBrowserClient()
  const router = useRouter()

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // campos del formulario
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('Español')
  // ...
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [pwd, setPwd] = useState('')

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Debes iniciar sesión para ver tu perfil.')
        setLoading(false)
        return
      }
      supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            setError(error.message)
            return
          }
          if (data) {
            setPerfil(data)
            setNombre(data.nombre)
            setApellidos(data.apellidos)
            setTelefono(data.telefono)
            setIdioma(data.idioma)
            // ... inicializar el resto de campos
          }
        })
        .finally(() => setLoading(false))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFirmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirmaFile(e.target.files?.[0] ?? null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    // 1) subir la firma al storage si hay archivo
    let firmaPath = perfil?.firma || null
    if (firmaFile) {
      const { data, error: uploadErr } = await supabase.storage
        .from('firmas')
        .upload(`firmas/${Date.now()}_${firmaFile.name}`, firmaFile, {
          upsert: true,
        })
      if (uploadErr) {
        setError(uploadErr.message)
        setLoading(false)
        return
      }
      firmaPath = data.path
    }

    // 2) hacer upsert en la tabla
    const { error: upsertErr } = await supabase
      .from('perfil')
      .upsert({
        user_id: perfil?.user_id ?? supabase.auth.getSession().then(r => r.data.session!.user.id),
        nombre,
        apellidos,
        telefono,
        idioma,
        // ... resto de campos
        firma: firmaPath,
        pwd: pwd || null,
      })
      .eq('user_id', perfil?.user_id ?? '')
    if (upsertErr) {
      setError(upsertErr.message)
      setLoading(false)
      return
    }

    // cerrar modal / recargar o redirigir al dashboard
    router.push('/dashboard')
  }

  if (loading) return <p>Cargando perfil…</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-2xl mb-4">Mi perfil</h1>
      <label className="block mb-2">
        Nombre
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="mt-1 block w-full border px-2 py-1 rounded"
        />
      </label>
      <label className="block mb-2">
        Apellidos
        <input
          type="text"
          value={apellidos}
          onChange={e => setApellidos(e.target.value)}
          className="mt-1 block w-full border px-2 py-1 rounded"
        />
      </label>
      <label className="block mb-2">
        Teléfono
        <input
          type="text"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          className="mt-1 block w-full border px-2 py-1 rounded"
        />
      </label>
      <label className="block mb-2">
        Idioma
        <select
          value={idioma}
          onChange={e => setIdioma(e.target.value)}
          className="mt-1 block w-full border px-2 py-1 rounded"
        >
          <option>Español</option>
          <option>Inglés</option>
        </select>
      </label>
      {/* ... agrega aquí los demás campos necesarios para Verifactu / Facturae ... */}
      <label className="block mb-4">
        Firma Digital FNMT
        <input
          type="file"
          onChange={handleFirmaChange}
          accept=".p12,.pfx"
          className="mt-1"
        />
      </label>
      <label className="block mb-4">
        Contraseña del P12
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          className="mt-1 block w-full border px-2 py-1 rounded"
        />
      </label>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Guardar perfil
      </button>
    </div>
  )
}
