'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '../../lib/supabaseClient'

type Factura = Database['public']['Tables']['facturas']['Row'] & {
  cliente: {
    nombre: string
  }
}

export default function FacturasPage() {
  const supabase = useSupabaseClient<Database>()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('facturas')
        .select('*, cliente:clientes(nombre)')
        .order('fecha_emisor', { ascending: false })

      if (!error && data) setFacturas(data as any)
    }
    fetch()
  }, [supabase])

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Facturas de venta</h1>
        <button
          onClick={() => router.push('/facturas/nueva')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Nueva factura
        </button>
      </div>
      {facturas.length === 0 ? (
        <div className="text-center mt-20 text-gray-500">
          <p>No hay facturas aún.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nº</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-b hover:bg-gray-100">
                  <td className="py-2">{f.numero || '-'}</td>
                  <td>{f.cliente?.nombre || 'Sin nombre'}</td>
                  <td>{new Date(f.fecha_emisor).toLocaleDateString()}</td>
                  <td>{f.total.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
