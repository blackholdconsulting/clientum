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
  domicilio: string
  codigo_postal: string
  localidad: string
  provincia: string
  pais: string
  telefono: string
  created_at: string
}

export default function ClientesPage() {
  const supabase = createPagesBrowserClient()
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          alert('Error cargando clientes: ' + error.message)
        } else {
          setClientes(data || [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl">Contactos</h1>
        <div>
          <button
            onClick={() => router.push('/clientes/nuevo')}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            + Nuevo contacto
          </button>
          <button className="border px-4 py-2 rounded">Importar contactos</button>
        </div>
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : clientes.length === 0 ? (
        <p>No tienes contactos aún.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow overflow-hidden">
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
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.razon_social}</td>
                <td className="px-4 py-2">{c.nif}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
}
