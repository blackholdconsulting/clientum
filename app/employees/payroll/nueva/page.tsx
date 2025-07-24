'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/database.types'

type Nomina = Database['public']['Tables']['nominas']['Row']

// Tipo reducido sólo para el select de empleados
type MiniEmpleado = Pick<
  Database['public']['Tables']['empleados']['Row'],
  'id' | 'first_name' | 'last_name'
>

export default function NuevaNominaPage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  const [empleados, setEmpleados] = useState<MiniEmpleado[]>([])
  const [form, setForm] = useState<Omit<Nomina, 'id' | 'created_at'>>({
    empleado_id: 0,
    fecha_emision: '',
    salario_bruto: 0,
    estado: 'pendiente',
  })
  const [errorMsg, setErrorMsg] = useState('')

  // Cargo sólo id, first_name y last_name de empleados
  useEffect(() => {
    async function loadEmpleados() {
      const { data, error } = await supabase
        .from('empleados')
        .select('id, first_name, last_name')
        .order('first_name')
      if (error) return console.error('Error al cargar empleados:', error)
      setEmpleados(data ?? [])
    }
    loadEmpleados()
  }, [supabase])

  // Maneja cambios en inputs y selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]:
        name === 'salario_bruto'
          ? Number(value)
          : name === 'empleado_id'
          ? Number(value)
          : value,
    }))
  }

  // Envía el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const { error } = await supabase.from('nominas').insert([form])
    if (error) {
      setErrorMsg(error.message)
    } else {
      router.push('/employees')
    }
  }

  return (
    <main className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6">Crear Nómina</h1>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Empleado */}
          <div>
            <label className="block text-sm font-medium mb-1">Empleado</label>
            <select
              name="empleado_id"
              value={form.empleado_id}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>Selecciona un empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de emisión */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de emisión
            </label>
            <input
              type="date"
              name="fecha_emision"
              value={form.fecha_emision}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Salario bruto */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Salario bruto (€)
            </label>
            <input
              type="number"
              name="salario_bruto"
              value={form.salario_bruto}
              onChange={handleChange}
              required
              className="w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Crear Nómina
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
