'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function ProfilePage() {
  const supabase = createPagesBrowserClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Todos los campos de tu tabla perfil:
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idioma, setIdioma] = useState('Español')
  const [empresa, setEmpresa] = useState('')
  const [nif, setNif] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [cp, setCp] = useState('')
  const [pais, setPais] = useState('España')
  const [email, setEmail] = useState('')
  const [web, setWeb] = useState('')
  // Firma digital P12
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [pwd, setPwd] = useState('')

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) throw new Error('Debes iniciar sesión.')
        return supabase
          .from('perfil')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
      })
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') throw error
        if (data) {
          setNombre(data.nombre)
          setApellidos(data.apellidos)
          setTelefono(data.telefono)
          setIdioma(data.idioma)
          setEmpresa(data.nombre_empr)
          setNif(data.nif)
          setDireccion(data.direccion)
          setCiudad(data.ciudad)
          setProvincia(data.provincia)
          setCp(data.cp)
          setPais(data.pais)
          setEmail(data.email)
          setWeb(data.web)
          // para la firma no cargamos el blob, sólo la ruta
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleFirmaChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFirmaFile(e.target.files?.[0] ?? null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    // 1) Subir P12 si hay
    let firmaPath: string | null = null
    if (firmaFile) {
      const { data, error: upErr } = await supabase.storage
        .from('firmas')
        .upload(`p12/${Date.now()}_${firmaFile.name}`, firmaFile, { upsert: true })
      if (upErr) {
        setError(upErr.message)
        setLoading(false)
        return
      }
      firmaPath = data.path
    }

    // 2) Obtener user_id
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session!.user.id

    // 3) Upsert
    const { error: errUp } = await supabase
      .from('perfil')
      .upsert(
        {
          user_id: userId,
          nombre, apellidos, telefono, idioma,
          nombre_empr: empresa,
          nif, direccion, ciudad, provincia, cp, pais,
          email, web,
          firma: firmaPath,
          pwd: pwd || null,
        },
        { onConflict: 'user_id' }
      )
    if (errUp) {
      setError(errUp.message)
      setLoading(false)
      return
    }

    // 4) redirige al Dashboard:
    router.push('/dashboard')
  }

  if (loading) return <div className="p-6">Cargando perfil…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Mi perfil</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          Nombre
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>

        <label className="block">
          Apellidos
          <input
            value={apellidos}
            onChange={e => setApellidos(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>

        <label className="block">
          Teléfono
          <input
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>

        <label className="block">
          Idioma
          <select
            value={idioma}
            onChange={e => setIdioma(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          >
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </label>
      </div>

      <h2 className="text-xl font-medium mb-2">Datos de Facturae / Verifactu</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          Razón Social
          <input
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block">
          NIF / CIF
          <input
            value={nif}
            onChange={e => setNif(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block col-span-2">
          Dirección fiscal
          <input
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block">
          Ciudad
          <input
            value={ciudad}
            onChange={e => setCiudad(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block">
          Provincia
          <input
            value={provincia}
            onChange={e => setProvincia(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block">
          CP
          <input
            value={cp}
            onChange={e => setCp(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block">
          País
          <input
            value={pais}
            onChange={e => setPais(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <label className="block">
          Email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <label className="block">
          Web
          <input
            value={web}
            onChange={e => setWeb(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
      </div>

      <h2 className="text-xl font-medium mb-2">Firma Digital FNMT</h2>
      <div className="mb-6">
        <label className="block mb-2">Selecciona tu P12 / PFX</label>
        <input
          type="file"
          accept=".p12,.pfx"
          onChange={handleFirmaChange}
          className="border rounded px-2 py-1"
        />
      </div>
      <label className="block mb-6">
        Contraseña del P12
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Guardar perfil
      </button>
    </div>
  )
}
