// app/negocio/proyectos/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { format } from 'date-fns'

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
      setProyectos([])
      setLoading(false)
      return
    }
    supabase
      .from('proyectos')
      .select('id, user_id, nombre, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error cargando proyectos:', error)
          setProyectos([])
        } else {
          setProyectos(data as Proyecto[] || [])
        }
        setLoading(false)
      })
  }, [session?.user?.id, supabase])

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-gray-900">Proyectos</h1>
          <p className="text-gray-600">
            Gestiona y accede a todos tus proyectos en un solo lugar.
          </p>
        </div>
        <Link
          href="/negocio/proyectos/nuevo"
          className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition"
        >
          + Crear proyecto
        </Link>
      </header>

      {/* Contenido */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Cargando proyectos…</div>
      ) : proyectos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          Aún no tienes ningún proyecto. ¡Empieza creando uno!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map((p) => (
            <Link
              key={p.id}
              href={`/negocio/proyectos/${p.id}`}
              className="block bg-white rounded-2xl shadow hover:shadow-lg transition p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                {p.nombre}
              </h2>
              <p className="text-gray-500 mb-4">
                Creado: {format(new Date(p.created_at), 'dd/MM/yyyy')}
              </p>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                Ver detalles →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
