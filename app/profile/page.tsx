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

  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('Español')
  // ... inicializa tus otros campos aquí
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [pwd, setPwd] = useState('')

  useEffect(() => {
    setLoading(true)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          setError('Debes iniciar sesión para ver tu perfil.')
          return
        }
        return supabase
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
              // ... asigna aquí el resto de campos
            }
          })
      })
      .catch(err => {
        setError(err.message)
      })
      .then(() => {
        setLoading(false)
      })
  }, [])

  const handleFirmaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirmaFile(e.target.files?.[0] ?? null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

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

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id

    const { error: upsertErr } = await supabase
      .from('perfil')
      .upsert(
        {
          user_id: perfil?.user_id || userId,
          nombre,
          apellidos,
          telefono,
          idioma,
          // ... resto de campos
          firma: firmaPath,
          pwd: pwd || null,
        },
        { onConflict: 'user_id' }
      )
      .eq('user_id', perfil?.user_id || userId || '')

    if (upsertErr) {
      setError(upsertErr.message)
      setLoading(false)
      return
    }

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

      {/* ... añade aquí los campos extra de Verifactu / Facturae ... */}

      <label className="block mb-4">
        Firma Digital FNMT (P12/PFX)
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
