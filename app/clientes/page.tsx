'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '../../lib/supabaseClient'

type Cliente = Database['public']['Tables']['clientes']['Row']

export default function ClientesPage() {
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase.from('clientes').select('*')
      if (error) console.error(error)
      else setClientes(data || [])
    }
    fetchClientes()
  }, [supabase])

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Contactos</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/clientes/nuevo')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            + Nuevo contacto
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50">
            Importar contactos
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <button className="px-4 py-1 border text-sm rounded-full bg-blue-100 text-blue-700 font-medium">
          Todos
        </button>
        <button className="px-4 py-1 border text-sm rounded-full text-gray-700">Empresas</button>
        <button className="px-4 py-1 border text-sm rounded-full text-gray-700">Personas</button>
        <select className="px-4 py-1 border text-sm rounded text-gray-700 bg-white">
          <option>Contactos A-Z</option>
        </select>
        <button className="text-sm text-blue-600 font-medium hover:underline">+ Filtro</button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-sm text-center md:text-left">
          <h2 className="text-xl font-semibold mb-4">Contactos</h2>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>✔️ Todos tus clientes, proveedores y oportunidades en un solo lugar.</li>
            <li>✔️ Gestiona la facturación de forma eficiente con cada uno de tus contactos.</li>
            <li>✔️ Toda la información siempre a la vista.</li>
          </ul>
        </div>
        <div>
          <img
            src="/contact-illustration.svg"
            alt="Ilustración"
            className="w-64 h-auto"
          />
        </div>
      </div>

      <div className="mt-10 bg-gray-100 p-4 rounded text-sm flex justify-between items-center">
        <span>📘 Aprende a importar y gestionar tus clientes y proveedores</span>
        <button className="bg-white px-4 py-1 border rounded hover:bg-gray-50">
          Leer artículo
        </button>
      </div>
    </div>
  )
}
