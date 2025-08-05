'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Link from 'next/link'

type Cliente = {
  id: string
  user_id: string
  nombre: string
  razon_social: string | null
  nif: string | null
  email: string | null
  domicilio: string | null
  codigo_postal: string | null
  localidad: string | null
  provincia: string | null
  pais: string | null
  telefono: string | null
  created_at: string
}

export default function ClientesPage() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  // Carga lista de clientes
  useEffect(() => {
    async function fetchClientes() {
      setLoading(true)
      const { data, error } = await supabase
        .from<Cliente>('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      setLoading(false)
      if (error) {
        alert('Error cargando contactos: ' + error.message)
      } else {
        setClientes(data || [])
      }
    }
    fetchClientes()
  }, [supabase])

  return (
    <main className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <div className="space-x-2">
          <Link
            href="/clientes/nuevo"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo contacto
          </Link>
          <button className="border px-4 py-2 rounded hover:bg-gray-100">
            Importar contactos
          </button>
        </div>
      </header>

      {/* Filtros estilo Holded (simplificado) */}
      <div className="flex space-x-2 mb-6">
        <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded">Todos</button>
        <button className="px-3 py-1 border rounded">Empresas</button>
        <button className="px-3 py-1 border rounded">Personas</button>
        <select className="px-3 py-1 border rounded">
          <option>Contactos A-Z</option>
          <option>Contactos Z-A</option>
        </select>
        <button className="px-3 py-1 text-blue-600">+ Filtro</button>
      </div>

      {/* Tarjeta de bienvenida */}
      {clientes.length === 0 && !loading && (
        <div className="bg-white shadow rounded p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Contactos</h2>
            <p className="mt-2 text-gray-600">
              ✅ Todos tus clientes, proveedores y oportunidades en un solo lugar. <br />
              ✅ Gestiona la facturación de forma eficiente con cada uno de tus contactos. <br />
              ✅ Toda la información siempre a la vista.
            </p>
          </div>
          <img
            src="/illustrations/contacts.svg"
            alt="Ilustración"
            className="w-40 h-40 object-contain"
          />
        </div>
      )}

      {/* Tabla de clientes */}
      {!loading && clientes.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full table-auto">
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
              {clientes.map(c => (
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-gray-500">Cargando contactos…</div>
      )}
    </main>
  )
}
