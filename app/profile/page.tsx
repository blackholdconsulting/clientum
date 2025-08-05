'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'  // Ajusta ruta si tu types están en otro lugar

export default function ProfilePage() {
  const supabase = createPagesBrowserClient<Database>()
  const router = useRouter()

  // Estado general
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Perfil
  const [perfilId, setPerfilId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')

  // Campos
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('Español')
  const [nombreEmpr, setNombreEmpr] = useState('')
  const [nif, setNif] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [cp, setCp] = useState('')
  const [pais, setPais] = useState('')
  const [email, setEmail] = useState('')
  const [web, setWeb] = useState('')

  // Firma digital (.p12)
  const [p12File, setP12File] = useState<File | null>(null)
  const [pwd, setPwd] = useState('')

  useEffect(() => {
    async function loadPerfil() {
      setLoading(true)
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        alert('Debes iniciar sesión para ver tu perfil.')
        router.push('/auth/login')
        return
      }
      setUserId(session.user.id)

      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        alert('Error cargando perfil: ' + error.message)
      }
      if (data) {
        setPerfilId(data.id)
        setNombre(data.nombre || '')
        setApellidos(data.apellidos || '')
        setTelefono(data.telefono || '')
        setIdioma(data.idioma || 'Español')
        setNombreEmpr(data.nombre_empr || '')
        setNif(data.nif || '')
        setDireccion(data.direccion || '')
        setCiudad(data.ciudad || '')
        setProvincia(data.provincia || '')
        setCp(data.cp || '')
        setPais(data.pais || '')
        setEmail(data.email || '')
        setWeb(data.web || '')
      }

      setLoading(false)
    }
    loadPerfil()
  }, [supabase, router])

  const handleP12 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setP12File(e.target.files[0])
  }

  const handleSave = async () => {
    setSaving(true)

    // 1) Sube .p12 si hay nuevo
    let firmaPath: string | null = null
    if (p12File) {
      const { data: up, error: upErr } = await supabase.storage
        .from('certs')
        .upload(`p12/${userId}.p12`, p12File, { upsert: true })
      if (upErr) {
        alert('Error al subir P12: ' + upErr.message)
        setSaving(false)
        return
      }
      firmaPath = up.path
    }

    // 2) Inserta o actualiza
    const payload = {
      id: perfilId ?? undefined,
      user_id: userId,
      nombre,
      apellidos,
      telefono,
      idioma,
      nombre_empr: nombreEmpr,
      nif,
      direccion,
      ciudad,
      provincia,
      cp,
      pais,
      email,
      web,
      firma: firmaPath ?? undefined,
      updated_at: new Date().toISOString(),
      // guarda pwd solo si lo rellenó
      ...(pwd ? { pwd } : {})
    }

    const { error: eqErr } = await supabase
      .from('perfil')
      .upsert(payload, { onConflict: 'user_id' })

    if (eqErr) {
      alert('Error guardando perfil: ' + eqErr.message)
    } else {
      // tras guardar, vuelve al dashboard
      router.push('/dashboard')
    }

    setSaving(false)
  }

  if (loading) return <p className="p-8">Cargando perfil…</p>

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl mb-6">Mi perfil</h1>
      <div className="grid grid-cols-2 gap-4">
        <input
          className="border p-2 col-span-2"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <input
          className="border p-2 col-span-2"
          placeholder="Apellidos"
          value={apellidos}
          onChange={e => setApellidos(e.target.value)}
        />
        <input
          className="border p-2 col-span-2"
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
        />
        <select
          className="border p-2 col-span-2"
          value={idioma}
          onChange={e => setIdioma(e.target.value)}
        >
          <option>Español</option>
          <option>Inglés</option>
        </select>

        {/* Empresa */}
        <input
          className="border p-2"
          placeholder="Razón social"
          value={nombreEmpr}
          onChange={e => setNombreEmpr(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="NIF / CIF"
          value={nif}
          onChange={e => setNif(e.target.value)}
        />
        <input
          className="border p-2 col-span-2"
          placeholder="Dirección"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Ciudad"
          value={ciudad}
          onChange={e => setCiudad(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Provincia"
          value={provincia}
          onChange={e => setProvincia(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Código postal"
          value={cp}
          onChange={e => setCp(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="País"
          value={pais}
          onChange={e => setPais(e.target.value)}
        />
        <input
          className="border p-2 col-span-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border p-2 col-span-2"
          placeholder="Web"
          value={web}
          onChange={e => setWeb(e.target.value)}
        />

        {/* Firma digital FNMT */}
        <label className="col-span-2 mt-4 font-medium">Firma Digital FNMT (.p12)</label>
        <input
          type="file"
          accept=".p12"
          onChange={handleP12}
          className="border p-2 col-span-2"
        />
        <input
          type="password"
          placeholder="Contraseña del P12"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          className="border p-2 col-span-2"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`mt-6 px-6 py-2 bg-blue-600 text-white rounded ${saving ? 'opacity-50' : ''}`}
      >
        {saving ? 'Guardando…' : 'Guardar perfil'}
      </button>
    </div>
  )
}
