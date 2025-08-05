'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  createPagesBrowserClient,
  Session
} from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'

export type Perfil = {
  id: string
  user_id: string
  nombre: string | null
  apellidos: string | null
  telefono: string | null
  idioma: string | null
  firma: string | null
}

export default function ProfilePage() {
  const supabase = createPagesBrowserClient<Database>()
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('Español')
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null)

  // 1) Recuperar sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('Debes iniciar sesión para ver tu perfil.')
        router.push('/auth/login?callbackUrl=/profile')
      } else {
        setSession(session)
      }
    })
  }, [supabase, router])

  // 2) Cargar datos de perfil
  useEffect(() => {
    if (!session) return
    setLoading(true)
    supabase
      .from<Perfil>('perfil')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data, error }) => {
        setLoading(false)
        if (error && error.code !== 'PGRST116') {
          alert('Error cargando perfil: ' + error.message)
        }
        if (data) {
          setPerfil(data)
          setNombre(data.nombre ?? '')
          setApellidos(data.apellidos ?? '')
          setTelefono(data.telefono ?? '')
          setIdioma(data.idioma ?? 'Español')
          if (data.firma) {
            const { data: urlData } = supabase
              .storage
              .from('firmas')
              .getPublicUrl(data.firma)
            setFirmaUrl(urlData.publicUrl)
          }
        }
      })
  }, [session, supabase])

  // 3) Manejadores de campos
  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFirmaFile(e.target.files[0])
    }
  }

  // 4) Guardar/upsert perfil
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session) return
    setSaving(true)

    // 4.a) subir firma si hay
    let firmaKey: string | null = perfil?.firma ?? null
    if (firmaFile) {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('firmas')
        .upload(
          `firma_${session.user.id}_${Date.now()}`,
          firmaFile,
          { upsert: true }
        )
      if (uploadError) {
        alert('Error subiendo firma: ' + uploadError.message)
        setSaving(false)
        return
      }
      firmaKey = uploadData.path
    }

    // 4.b) insertar o actualizar perfil
    const { error: upsertError } = await supabase
      .from<Perfil>('perfil')
      .upsert(
        {
          user_id: session.user.id,
          nombre,
          apellidos,
          telefono,
          idioma,
          firma: firmaKey
        },
        { onConflict: 'user_id' }
      )
    if (upsertError) {
      alert('Error guardando perfil: ' + upsertError.message)
      setSaving(false)
      return
    }

    // 4.c) refrescar datos en pantalla
    const { data: refreshed, error: refError } = await supabase
      .from<Perfil>('perfil')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
    if (refError) {
      alert('Error refrescando perfil: ' + refError.message)
    } else if (refreshed) {
      setPerfil(refreshed)
      if (refreshed.firma) {
        const { data: urlData } = supabase
          .storage
          .from('firmas')
          .getPublicUrl(refreshed.firma)
        setFirmaUrl(urlData.publicUrl)
      }
    }
    setSaving(false)
  }

  // 5) Render
  if (loading) {
    return <p className="p-4">Cargando perfil…</p>
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-6">Mi perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={e => setApellidos(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Idioma</label>
          <select
            value={idioma}
            onChange={e => setIdioma(e.target.value)}
            className="w-full border px-2 py-1"
          >
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </div>

        <div>
          <label>Email</label>
          <input
            type="text"
            value={session?.user.email ?? ''}
            disabled
            className="w-full bg-gray-100 px-2 py-1"
          />
        </div>

        <div>
          <label>Firma Digital</label>
          <div className="flex items-center space-x-4">
            <div className="w-40 h-24 bg-gray-200 flex items-center justify-center">
              {firmaUrl ? (
                <img src={firmaUrl} alt="firma" className="max-h-full" />
              ) : (
                <span>Sin firma</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleChangeFile} />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </form>
    </main>
  )
}
