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

  // 1) Cargamos sesión + perfil al montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('Debes iniciar sesión para ver tu perfil.')
        router.push('/login')
        return
      }
      setSession(session)

      // traemos datos de perfil
      supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setNombre(data.nombre || '')
            setApellidos(data.apellidos || '')
            setTelefono(data.telefono || '')
            setIdioma(data.idioma || 'Español')
            // no pre-cargamos firma aquí para simplificar
          }
        })
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) {
    return <p>Cargando perfil…</p>
  }

  // 2) Handler de subir archivo
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFirmaFile(e.target.files[0])
    }
  }

  // 3) Guardar perfil + firma
  const saveProfile = async () => {
    if (!session) return
    setSaving(true)

    // subimos firma si hay archivo
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

    // upsert perfil
    const { error: perfErr } = await supabase
      .from('perfil')
      .upsert({
        user_id: session.user.id,
        nombre,
        apellidos,
        telefono,
        idioma,
        firma: firmaPath
      }, { onConflict: 'user_id' })

    if (perfErr) {
      alert(`Error guardando perfil: ${perfErr.message}`)
      setSaving(false)
      return
    }

    // una vez guardado, volvemos al dashboard
    router.push('/dashboard')
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Mi perfil</h1>
      <label>
        Nombre<br/>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </label>
      <br/><br/>
      <label>
        Apellidos<br/>
        <input
          value={apellidos}
          onChange={e => setApellidos(e.target.value)}
        />
      </label>
      <br/><br/>
      <label>
        Teléfono<br/>
        <input
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
        />
      </label>
      <br/><br/>
      <label>
        Idioma<br/>
        <select
          value={idioma}
          onChange={e => setIdioma(e.target.value)}
        >
          <option>Español</option>
          <option>Inglés</option>
        </select>
      </label>
      <br/><br/>
      <label>
        Firma Digital<br/>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </label>
      <br/><br/>
      <button onClick={saveProfile} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar perfil'}
      </button>
    </main>
  )
}
