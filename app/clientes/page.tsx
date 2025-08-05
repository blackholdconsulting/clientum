// app/clientes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'

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
  const supabase = createPagesBrowserClient<Database>()
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<'todos'|'empresa'|'persona'>('todos')
  const [ordenAZ, setOrdenAZ] = useState<'asc'|'desc'>('asc')

  // cargar clientes
  useEffect(() => {
    setLoading(true)
    supabase
      .from<'clientes', Cliente>('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setClientes(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // manejar filtros
  const clientesFiltrados = clientes
    .filter(c => filtroTipo === 'todos' ? true : c.tipo === filtroTipo)
    .sort((a, b) => {
      const cmp = a.nombre.localeCompare(b.nombre)
      return ordenAZ === 'asc' ? cmp : -cmp
    })

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push('/clientes/nuevo')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nuevo contacto
          </button>
          <button
            onClick={() => router.push('/clientes/importar')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Importar contactos
          </button>
        </div>
      </header>

      {/* filtros */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          className={`px-3 py-1 rounded ${filtroTipo==='todos'?'bg-blue-100':'hover:bg-gray-100'}`}
          onClick={() => setFiltroTipo('todos')}
        >
          Todos
        </button>
        <button
          className={`px-3 py-1 rounded ${filtroTipo==='empresa'?'bg-blue-100':'hover:bg-gray-100'}`}
          onClick={() => setFiltroTipo('empresa')}
        >
          Empresas
        </button>
        <button
          className={`px-3 py-1 rounded ${filtroTipo==='persona'?'bg-blue-100':'hover:bg-gray-100'}`}
          onClick={() => setFiltroTipo('persona')}
        >
          Personas
        </button>
        <select
          value={ordenAZ}
          onChange={e => setOrdenAZ(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="asc">Contactos A-Z</option>
          <option value="desc">Contactos Z-A</option>
        </select>
        {/* aquí podrías añadir "+ Filtro" */}
      </div>

      {loading
        ? <div>Cargando...</div>
        : (
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Razón social</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">NIF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientesFiltrados.map(c => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/clientes/${c.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{c.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.razon_social}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.nif}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.telefono}</td>
                  </tr>
                ))}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No hay contactos que mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
