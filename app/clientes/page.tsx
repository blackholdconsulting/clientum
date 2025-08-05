'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

type Cliente = {
  id: string
  user_id: string
  nombre: string
  razon_social: string
  nif: string
  email: string
  telefono: string
  tipo: 'empresa' | 'persona'
  created_at: string
}

export default function ClientesPage() {
  const router = useRouter()
  const supabase = createPagesBrowserClient()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'empresa' | 'persona'>('todos')

  // Carga inicial de datos
  useEffect(() => {
    setLoading(true)
    supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          alert(`Error cargando clientes: ${error.message}`)
        } else {
          setClientes(data || [])
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Filtra según tipo
  const filtered = clientes.filter(c => {
    if (filter === 'empresa') return c.tipo === 'empresa'
    if (filter === 'persona') return c.tipo === 'persona'
    return true
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contactos</h1>

      {/* Filtros */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          className={`px-3 py-1 rounded ${filter === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('todos')}
        >
          Todos
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === 'empresa' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('empresa')}
        >
          Empresas
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === 'persona' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('persona')}
        >
          Personas
        </button>
        <select className="ml-4 border rounded px-2 py-1">
          <option>Contactos A–Z</option>
          <option>Contactos Z–A</option>
        </select>
        <button className="ml-2 text-blue-600">+ Filtro</button>
      </div>

      {/* Acciones */}
      <div className="flex justify-end mb-4 space-x-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/clientes/nuevo')}
        >
          + Nuevo contacto
        </button>
        <button className="border px-4 py-2 rounded">Importar contactos</button>
      </div>

      {/* Tabla de datos */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Razón social</th>
                <th className="px-4 py-2 text-left">NIF</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cliente => (
                <tr key={cliente.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{cliente.nombre}</td>
                  <td className="px-4 py-2">{cliente.razon_social}</td>
                  <td className="px-4 py-2">{cliente.nif}</td>
                  <td className="px-4 py-2">{cliente.email}</td>
                  <td className="px-4 py-2">{cliente.telefono}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                    No hay contactos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
