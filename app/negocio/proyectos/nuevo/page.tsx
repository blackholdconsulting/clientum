// app/negocio/proyectos/nuevo/page.tsx
'use client'

import React, { FormEvent, useState } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoProyectoPage() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session) {
      setErrorMsg('Debes iniciar sesión para crear un proyecto.')
      return
    }
    if (!nombre.trim()) {
      setErrorMsg('El nombre del proyecto no puede estar vacío.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('proyectos')
      .insert({
        user_id: session.user.id,
        nombre: nombre.trim()
      })
      .select('id')
      .single()
    setLoading(false)

    if (error) {
      console.error('Error creando proyecto:', error)
      setErrorMsg('Ocurrió un error al crear el proyecto.')
    } else {
      // ir a la lista de proyectos
      router.push('/negocio/proyectos')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nuevo Proyecto</h1>
        <Link
          href="/negocio/proyectos"
          className="text-blue-600 hover:underline"
        >
          ← Volver
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        {errorMsg && (
          <div className="text-red-600 bg-red-100 p-2 rounded">
            {errorMsg}
          </div>
        )}

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre del proyecto
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Introduce el nombre"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg shadow ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition`}
          >
            {loading ? 'Creando…' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  )
}
