'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

type Cliente = {
  id: string
  user_id: string
  nombre: string
  razon_social: string | null
  nif: string | null
  email: string | null
  telefono: string | null
  tipo: 'empresa' | 'persona'
  created_at: string
}

export default function ClientesPage() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'empresa' | 'persona'>('todos')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth/login')
          return
        }
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setClientes(data || [])
      } catch (err: any) {
        alert('Error cargando contactos: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase, router])

  const filtered = clientes.filter(c => {
    if (filter === 'empresa') return c.tipo === 'empresa'
    if (filter === 'persona') return c.tipo === 'persona'
    return true
  })

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push('/clientes/nuevo')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo contacto
          </button>
          <button
            onClick={() => router.push('/clientes/importar')}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Importar contactos
          </button>
        </div>
      </header>

      <div className="flex items-center space-x-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            filter === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('todos')}
        >
          Todos
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filter === 'empresa' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setFilter('empresa')}
        >
          Empresas
        </button>
        <button
          className={`px-3 py-1 rounded ${
            filter === 'persona' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
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

      {loading ? (
        <p>Cargando contactos…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No tienes contactos.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Razón social</th>
                <th className="px-4 py-2 text-left">NIF</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/clientes/${c.id}`)}
                >
                  <td className="px-4 py-3">{c.nombre}</td>
                  <td className="px-4 py-3">{c.razon_social || '—'}</td>
                  <td className="px-4 py-3">{c.nif || '—'}</td>
                  <td className="px-4 py-3">{c.email || '—'}</td>
                  <td className="px-4 py-3">{c.telefono || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
