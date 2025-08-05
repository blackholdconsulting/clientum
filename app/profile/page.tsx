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

  // Campos requeridos por Verifactu/Facturae
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('es')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [nif, setNif] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [cp, setCp] = useState('')
  const [pais, setPais] = useState('España')
  const [web, setWeb] = useState('')
  const [firmaFile, setFirmaFile] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      // 1) Comprueba sesión
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        alert('Debes iniciar sesión para ver tu perfil.')
        router.push('/auth/login')
        return
      }
      setSession(session)

      // 2) Carga perfil
      const { data: perfil } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (perfil) {
        setNombre(perfil.nombre ?? '')
        setApellidos(perfil.apellidos ?? '')
        setTelefono(perfil.telefono ?? '')
        setIdioma(perfil.idioma ?? 'es')
        setEmail(perfil.email ?? session.user.email ?? '')
        setEmpresa(perfil.nombre_empr ?? '')
        setNif(perfil.nif ?? '')
        setDireccion(perfil.direccion ?? '')
        setCiudad(perfil.ciudad ?? '')
        setProvincia(perfil.provincia ?? '')
        setCp(perfil.cp ?? '')
        setPais(perfil.pais ?? 'España')
        setWeb(perfil.web ?? '')
      }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  if (loading) {
    return <div className="p-8">Cargando perfil…</div>
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFirmaFile(e.target.files[0])
  }

  const saveProfile = async () => {
    if (!session) return
    setSaving(true)

    let firmaPath: string | null = null
    if (firmaFile) {
      const { data, error } = await supabase.storage
        .from('firmas')
        .upload(`${session.user.id}/${firmaFile.name}`, firmaFile, {
          upsert: true,
        })
      if (error) {
        alert('Error subiendo firma: ' + error.message)
        setSaving(false)
        return
      }
      firmaPath = data.path
    }

    const { error } = await supabase
      .from('perfil')
      .upsert(
        {
          user_id: session.user.id,
          nombre,
          apellidos,
          telefono,
          idioma,
          email,
          nombre_empr: empresa,
          nif,
          direccion,
          ciudad,
          provincia,
          cp,
          pais,
          web,
          firma: firmaPath,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      alert('Error guardando perfil: ' + error.message)
      setSaving(false)
      return
    }

    // redirige al dashboard
    router.push('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Mi perfil</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <label className="block">
            <span className="font-medium">Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Apellidos</span>
            <input
              type="text"
              value={apellidos}
              onChange={e => setApellidos(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Teléfono</span>
            <input
              type="text"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Idioma</span>
            <select
              value={idioma}
              onChange={e => setIdioma(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </label>
          <label className="block">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full bg-gray-100 border rounded px-3 py-2"
              disabled
            />
          </label>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <label className="block">
            <span className="font-medium">Empresa / Razón Social</span>
            <input
              type="text"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">NIF / CIF</span>
            <input
              type="text"
              value={nif}
              onChange={e => setNif(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Dirección</span>
            <input
              type="text"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Ciudad</span>
            <input
              type="text"
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Provincia</span>
            <input
              type="text"
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <div className="flex gap-4">
            <label className="block flex-1">
              <span className="font-medium">Código Postal</span>
              <input
                type="text"
                value={cp}
                onChange={e => setCp(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block flex-1">
              <span className="font-medium">País</span>
              <input
                type="text"
                value={pais}
                onChange={e => setPais(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="font-medium">Web</span>
            <input
              type="text"
              value={web}
              onChange={e => setWeb(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-medium">Firma Digital (PDF/PNG)</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={onFileChange}
              className="mt-1 block w-full"
            />
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </div>
    </div>
  )
}
