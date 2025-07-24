// app/employees/page.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type Empleado = Database['public']['Tables']['empleados']['Row']

export default function EmployeesPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchEmpleados = async () => {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('last_name', { ascending: true })
      if (error) {
        console.error('Error al cargar empleados:', error)
      } else {
        setEmpleados(data ?? [])
      }
    }
    fetchEmpleados()
  }, [supabase])

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Empleados</h1>
        <Link
          href="/employees/nuevo"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded shadow"
        >
          Añadir empleado
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Apellido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puesto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empleados.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {emp.first_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {emp.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {emp.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {emp.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {emp.salary.toLocaleString('es-ES')} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      emp.status === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                  <Link
                    href={`/employees/editar/${emp.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={async () => {
                      if (confirm('¿Eliminar este empleado?')) {
                        const { error } = await supabase
                          .from('empleados')
                          .delete()
                          .eq('id', emp.id)
                        if (error) {
                          alert('Error al eliminar: ' + error.message)
                        } else {
                          setEmpleados((prev) =>
                            prev.filter((e) => e.id !== emp.id)
                          )
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  No hay empleados registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
