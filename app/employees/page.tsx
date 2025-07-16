'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { jsPDF } from 'jspdf'
import type { Database } from '../../lib/supabaseClient'

type Employee = Database['public']['Tables']['employees']['Row']

export default function EmployeesPage() {
  const supabase = useSupabaseClient<Database>()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // 1) Carga inicial
  const fetchEmployees = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else      setEmployees(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  // 2) Añadir empleado
  const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const nuevo: Partial<Employee> = {
      first_name: form.get('first_name') as string,
      last_name: form.get('last_name') as string,
      email: form.get('email') as string,
      position: form.get('position') as string,
      salary: form.get('salary') ? Number(form.get('salary')) : null,
      hired_at: form.get('hired_at') as string,
      status: form.get('status') as Employee['status'],
    }
    const { error } = await supabase.from('employees').insert(nuevo)
    if (error) setError(error.message)
    else {
      setShowModal(false)
      fetchEmployees()
    }
  }

  // 3) Eliminar empleado
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este empleado?')) return
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) alert('Error borrando: ' + error.message)
    else      fetchEmployees()
  }

  // 4) Exportar CSV
  const handleExportCSV = () => {
    if (!employees.length) return
    const headers = Object.keys(employees[0])
    const rows = employees.map(emp =>
      headers.map(h => JSON.stringify((emp as any)[h] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'empleados.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 5) Exportar PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    doc.setFontSize(16)
    doc.text('Lista de Empleados', 40, 50)
    const startY = 80, lineH = 20
    const cols = ['Nombre','Apellidos','Email','Puesto','Salario','Alta','Estado']
    cols.forEach((col,i) => doc.text(col, 40 + i*80, startY))
    employees.forEach((e,rowIdx) => {
      const y = startY + lineH*(rowIdx+1)
      const vals = [
        e.first_name,
        e.last_name,
        e.email ?? '',
        e.position ?? '',
        e.salary?.toString() ?? '',
        e.hired_at ?? '',
        e.status ?? ''
      ]
      vals.forEach((v,i) => doc.text(v, 40 + i*80, y))
    })
    doc.save('empleados.pdf')
  }

  return (
    <section style={{ padding: 24 }}>
      {/* Cabecera idéntica */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>👥 Empleados</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: 4
            }}
          >
            Exportar CSV
          </button>
          <button
            onClick={handleExportPDF}
            style={{
              padding: '6px 12px',
              backgroundColor: '#16a34a',
              color: '#fff',
              borderRadius: 4
            }}
          >
            Exportar PDF
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              borderRadius: 4
            }}
          >
            + Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error   && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading && <p>Cargando empleados…</p>}

      {/* Tabla igual que Clientes */}
      {!loading && employees.length > 0 ? (
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                {['Nombre','Apellidos','Email','Puesto','Salario','Alta','Estado','Acciones']
                  .map(h => (
                    <th
                      key={h}
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        textAlign: 'left'
                      }}
                    >
                      {h}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 8 }}>{emp.first_name}</td>
                  <td style={{ padding: 8 }}>{emp.last_name}</td>
                  <td style={{ padding: 8 }}>{emp.email}</td>
                  <td style={{ padding: 8 }}>{emp.position}</td>
                  <td style={{ padding: 8 }}>{emp.salary?.toLocaleString('es-ES',{ style:'currency',currency:'EUR'})}</td>
                  <td style={{ padding: 8 }}>{emp.hired_at}</td>
                  <td style={{ padding: 8 }}>{emp.status}</td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => alert('Editar ' + emp.first_name)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#fbbf24',
                        borderRadius: 4,
                        border: 'none'
                      }}
                    >
                      Editar
                    </button>{' '}
                    <button
                      onClick={() => handleDelete(emp.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        borderRadius: 4,
                        border: 'none'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p style={{ marginTop: 16 }}>No hay empleados aún.</p>
      )}

      {/* Modal Nuevo Empleado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Nuevo Empleado</h2>
            <form
              onSubmit={handleAddEmployee}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { name: 'first_name', label: 'Nombre' },
                { name: 'last_name', label: 'Apellidos' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'position', label: 'Puesto' },
                { name: 'salary', label: 'Salario', type: 'number' },
                { name: 'hired_at', label: 'Fecha de alta', type: 'date' },
                { name: 'status', label: 'Estado', as: 'select', options: ['activo','inactivo'] }
              ].map(field => (
                <div key={field.name} className="flex flex-col">
                  <label className="mb-1 font-medium">{field.label}</label>
                  {field.as === 'select' ? (
                    <select
                      name={field.name}
                      className="border px-2 py-1 rounded"
                      defaultValue="activo"
                    >
                      {field.options!.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type || 'text'}
                      required
                      className="border px-2 py-1 rounded"
                    />
                  )}
                </div>
              ))}
              <div className="col-span-full flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
