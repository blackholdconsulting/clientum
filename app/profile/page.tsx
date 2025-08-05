'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [perfil, setPerfil] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    idioma: 'Español',
    email: '',
    nombre_empresa: '',
    nif: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    cp: '',
    pais: '',
    web: '',
    firma: null as File | null,
  })

  // Carga el perfil al montar
  useEffect(() => {
    async function fetchPerfil() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          alert('Debes iniciar sesión para ver tu perfil.')
          router.push('/auth/login?callbackUrl=/profile')
          return
        }

        const { data } = await supabase
          .from('perfil')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (data) {
          setPerfil({
            ...perfil,
            ...data,
            firma: null,
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchPerfil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPerfil((p) => ({ ...p, [name]: value }))
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPerfil((p) => ({ ...p, firma: e.target.files![0] }))
    }
  }

  const savePerfil = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // 1) sube firma si la hay
      let firmaPath: string | null = null
      if (perfil.firma) {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('firmas')
          .upload(`firma-${Date.now()}`, perfil.firma, { upsert: true })
        if (uploadErr) throw uploadErr
        firmaPath = uploadData.path
      }

      // 2) guarda datos
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user_id = session?.user.id
      if (!user_id) throw new Error('Sesión inválida.')

      const { error: upErr } = await supabase
        .from('perfil')
        .upsert(
          {
            user_id,
            nombre: perfil.nombre,
            apellidos: perfil.apellidos,
            telefono: perfil.telefono,
            idioma: perfil.idioma,
            email: perfil.email,
            nombre_empresa: perfil.nombre_empresa,
            nif: perfil.nif,
            direccion: perfil.direccion,
            ciudad: perfil.ciudad,
            provincia: perfil.provincia,
            cp: perfil.cp,
            pais: perfil.pais,
            web: perfil.web,
            firma: firmaPath,
          },
          { onConflict: 'user_id' }
        )
      if (upErr) throw upErr

      alert('Perfil guardado.')
      router.push('/dashboard')
    } catch (err: any) {
      alert('Error guardando perfil: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Cargando perfil…</div>

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow rounded">
      <h1 className="text-2xl mb-6">Mi perfil</h1>
      <form onSubmit={savePerfil} className="space-y-4">
        {/* Campos como antes... copia y pega todos los inputs/selects aquí */}
        <div>
          <label>Nombre</label>
          <input
            name="nombre"
            value={perfil.nombre}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        {/* ... resto de campos ... */}
        <div>
          <label>Firma Digital (PDF FNMT)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFile}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}
