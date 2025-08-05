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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('Debes iniciar sesión para ver tu perfil.')
        router.push('/auth/login?callbackUrl=/profile')
        return
      }

      supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setPerfil({
              ...perfil,
              ...data,
              firma: null, // no cargamos el file en el state
            })
          }
        })
        .finally(() => setLoading(false))
    })
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

    // 1) sube firma si la hay
    let firmaPath = null
    if (perfil.firma) {
      const { data, error } = await supabase.storage
        .from('firmas')
        .upload(`firma-${Date.now()}`, perfil.firma, { upsert: true })

      if (error) {
        alert('Error subiendo firma: ' + error.message)
        setSaving(false)
        return
      }
      firmaPath = data.path
    }

    // 2) guarda datos
    const { data: sess } = await supabase.auth.getSession()
    const user_id = sess?.session?.user.id
    if (!user_id) {
      alert('Sesión inválida.')
      setSaving(false)
      return
    }

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

    if (upErr) {
      alert('Error guardando perfil: ' + upErr.message)
      setSaving(false)
      return
    }

    // 3) cierra modal o redirige
    alert('Perfil guardado.')
    router.push('/dashboard')
  }

  if (loading) return <div className="p-8">Cargando perfil…</div>

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow rounded">
      <h1 className="text-2xl mb-6">Mi perfil</h1>
      <form onSubmit={savePerfil} className="space-y-4">
        <div>
          <label>Nombre</label>
          <input
            name="nombre"
            value={perfil.nombre}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label>Apellidos</label>
          <input
            name="apellidos"
            value={perfil.apellidos}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            name="telefono"
            value={perfil.telefono}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label>Idioma</label>
          <select
            name="idioma"
            value={perfil.idioma}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </div>
        <div>
          <label>Email</label>
          <input
            name="email"
            value={perfil.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded bg-gray-100"
            disabled
          />
        </div>
        <div>
          <label>Razón Social</label>
          <input
            name="nombre_empresa"
            value={perfil.nombre_empresa}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label>NIF / CIF</label>
          <input
            name="nif"
            value={perfil.nif}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label>Dirección</label>
          <input
            name="direccion"
            value={perfil.direccion}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Ciudad</label>
            <input
              name="ciudad"
              value={perfil.ciudad}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label>Provincia</label>
            <input
              name="provincia"
              value={perfil.provincia}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Código Postal</label>
            <input
              name="cp"
              value={perfil.cp}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label>País</label>
            <input
              name="pais"
              value={perfil.pais}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div>
          <label>Web</label>
          <input
            name="web"
            value={perfil.web}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
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
