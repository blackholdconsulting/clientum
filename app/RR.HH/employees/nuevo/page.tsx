'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export default function NewEmployeePage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    salary: '',
    status: 'activo',
    hired_at: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.from('empleados').insert({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      position: form.position,
      salary: Number(form.salary),
      status: form.status,
      hired_at: form.hired_at,
    })

    setLoading(false)
    if (error) setErrorMsg(error.message)
    else router.push('/employees')
  }

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6">+ Nuevo Empleado</h1>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-gray-700">Nombre</span>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Apellidos</span>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Puesto</span>
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Salario (€)</span>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Fecha de Alta</span>
            <input
              type="date"
              name="hired_at"
              value={form.hired_at}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Estado</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>

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
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Guardando…' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
