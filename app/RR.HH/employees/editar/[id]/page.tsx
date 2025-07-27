'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types' // ← CORREGIDO

type Empleado = Database['public']['Tables']['empleados']['Row']

export default function EditarEmpleadoPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const [form, setForm] = useState<Empleado | null>(null)

  useEffect(() => {
    const fetchEmpleado = async () => {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('id', id)
        .single()
      if (!error) setForm(data)
    }
    fetchEmpleado()
  }, [id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    const { error } = await supabase
      .from('empleados')
      .update({
        ...form,
        salary: parseFloat(String(form.salary)),
      })
      .eq('id', id)

    if (error) {
      alert('Error al actualizar: ' + error.message)
    } else {
      router.push('/employees')
    }
  }

  if (!form) return <p className="p-4">Cargando empleado...</p>

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Empleado</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <input
          name="position"
          value={form.position}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <input
          name="salary"
          value={form.salary}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Actualizar
        </button>
      </form>
    </main>
  )
}

