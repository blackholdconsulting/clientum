'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '@/lib/supabaseClient'

type Nomina = Database['public']['Tables']['nominas']['Row']

export default function EditarNominaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()

  const [nomina, setNomina] = useState<Nomina | null>(null)
  const [salario, setSalario] = useState(0)
  const [estado, setEstado] = useState<'pendiente' | 'pagada'>('pendiente')
  const [fecha, setFecha] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('nominas')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setNomina(data)
        setSalario(data.salario_bruto)
        setEstado(data.estado)
        setFecha(data.fecha_emision)
      } else if (error) {
        setError(error.message)
      }
    }

    if (id) fetch()
  }, [id, supabase])

  const handleSubmit = async () => {
    if (!nomina) return
    const { error } = await supabase.from('nominas').update({
      salario_bruto: salario,
      estado,
      fecha_emision: fecha,
    }).eq('id', nomina.id)

    if (error) {
      setError(error.message)
    } else {
      router.push('/employees/payroll')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">✏️ Editar Nómina</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium mb-1">Fecha emisión</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border px-2 py-1 rounded w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Salario bruto</label>
          <input type="number" value={salario} onChange={(e) => setSalario(Number(e.target.value))} className="border px-2 py-1 rounded w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as any)} className="border px-2 py-1 rounded w-full">
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => router.push('/employees/payroll')} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>
  )
}
