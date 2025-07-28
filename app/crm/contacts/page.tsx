// app/crm/contacts/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import Link from 'next/link'

type Contacto = Database['public']['Tables']['clientes']['Row']

export default function ContactsPage() {
  const supabase = createClientComponentClient<Database>()
  const [contactos, setContactos] = useState<Contacto[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) {
        console.error('Error cargando contactos:', error)
      } else {
        setContactos(data)
      }
    }
    load()
  }, [supabase])

  return (
    <main className="p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Link
          href="/crm/contacts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nuevo Contacto
        </Link>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {contactos.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.nombre}</td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2">{c.telefono ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
