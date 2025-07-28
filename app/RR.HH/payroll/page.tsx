'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'  // ← IMPORTACIÓN CORRECTA

type Nomina = Database['public']['Tables']['nominas']['Row']
type Empleado = Database['public']['Tables']['empleados']['Row']

export default function ListaNominasPage() {
  const supabase = createClientComponentClient<Database>()
  const [nominas, setNominas] = useState<Nomina[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      const { data: nomData, error: nomError } = await supabase
        .from('nominas')
        .select('*')
        .order('fecha_emision', { ascending: false })

      const { data: empData, error: empError } = await supabase
        .from('empleados')
        .select('*')

      if (nomError) console.error('Error nóminas:', nomError.message)
      if (empError) console.error('Error empleados:', empError.message)

      if (nomData) setNominas(nomData)
      if (empData) setEmpleados(empData)
    }
    fetchAll()
  }, [supabase])

  const getEmpleadoNombre = (id: number) => {
    const emp = empleados.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : '—'
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Listado de Nóminas</h1>
        <a
          href="/employees/payroll/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nueva Nómina
        </a>
      </div>

      <table className="w-full table-auto border-collapse bg-white shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border">Empleado</th>
            <th className="px-4 py-2 border">Fecha Emisión</th>
            <th className="px-4 py-2 border">Salario Bruto</th>
            <th className="px-4 py-2 border">Estado</th>
          </tr>
        </thead>
        <tbody>
          {nominas.map((n) => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{getEmpleadoNombre(n.empleado_id)}</td>
              <td className="px-4 py-2 border">{n.fecha_emision}</td>
              <td className="px-4 py-2 border">{n.salario_bruto.toFixed(2)} €</td>
              <td className="px-4 py-2 border capitalize">{n.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
