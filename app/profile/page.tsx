'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/auth-helpers-nextjs'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('Español')
  const [firmaFile, setFirmaFile] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        alert('Debes iniciar sesión para ver tu perfil.')
        router.push('/login')
        return
      }
      setSession(session)

      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setNombre(data.nombre || '')
        setApellidos(data.apellidos || '')
        setTelefono(data.telefono || '')
        setIdioma(data.idioma || 'Español')
      }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  if (loading) {
    return <p>Cargando perfil…</p>
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFirmaFile(e.target.files[0])
    }
  }

  const saveProfile = async () => {
    if (!session) return
    setSaving(true)

    let firmaPath: string | null = null
    if (firmaFile) {
      const { data, error: upErr } = await supabase.storage
        .from('firmas')
        .upload(`${session.user.id}/${firmaFile.name}`, firmaFile, {
          upsert: true
        })
      if (upErr) {
        alert(`Error subiendo firma: ${upErr.message}`)
        setSaving(false)
        return
      }
      firmaPath = data.path
    }

    const { error: perfErr } = await supabase
      .from('perfil')
      .upsert(
        {
          user_id: session.user.id,
          nombre,
          apellidos,
          telefono,
          idioma,
          firma: firmaPath
        },
        { onConflict: 'user_id' }
      )

    if (perfErr) {
      alert(`Error guardando perfil: ${perfErr.message}`)
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Mi perfil</h1>
      <label>
        Nombre<br />
        <input value={nombre} onChange={e => setNombre(e.target.value)} />
      </label>
      <br />
      <br />
      <label>
        Apellidos<br />
        <input
          value={apellidos}
          onChange={e => setApellidos(e.target.value)}
        />
      </label>
      <br />
      <br />
      <label>
        Teléfono<br />
        <input
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
        />
      </label>
      <br />
      <br />
      <label>
        Idioma<br />
        <select
          value={idioma}
          onChange={e => setIdioma(e.target.value)}
        >
          <option>Español</option>
          <option>Inglés</option>
        </select>
      </label>
      <br />
      <br />
      <label>
        Firma Digital<br />
        <input type="file" accept="image/*" onChange={onFileChange} />
      </label>
      <br />
      <br />
      <button onClick={saveProfile} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar perfil'}
      </button>
    </main>
  )
}
