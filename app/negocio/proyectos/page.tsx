// app/negocio/proyectos/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

type Proyecto = {
  id: number
  user_id: string
  nombre: string
  created_at: string
}

export default function ProyectosPage() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      console.debug('❌ No hay sesión activa, limpiando lista de proyectos.')
      setProyectos([])
      setLoading(false)
      return
    }

    console.debug('⏳ Cargando proyectos para usuario:', session.user.id)
    supabase
      .from('proyectos')
      .select('id, user_id, nombre, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error cargando proyectos:', error)
          setProyectos([])
        } else {
          console.debug('✅ Proyectos recibidos:', data)
          setProyectos(data as Proyecto[] || [])
        }
        setLoading(false)
      })
  }, [session?.user?.id, supabase])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Link
          href="/negocio/proyectos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Crear proyecto
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando proyectos…</p>
      ) : proyectos.length === 0 ? (
        <p className="text-gray-500">No tienes ningún proyecto creado.</p>
      ) : (
        <ul className="space-y-2">
          {proyectos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/negocio/proyectos/${p.id}`}
                className="block px-4 py-3 border rounded hover:bg-gray-50 transition"
              >
                {p.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
