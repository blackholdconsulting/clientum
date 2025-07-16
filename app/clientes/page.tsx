// app/clientes/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { jsPDF } from 'jspdf'
import type { Database } from '../../lib/supabaseClient'

type Cliente = Database['public']['Tables']['clientes']['Row']

export default function ClientesPage() {
  const supabase = useSupabaseClient<Database>()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Carga inicial
  const fetchClientes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else      setClientes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  // Añadir cliente
  const handleAddCliente = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const nuevo = {
      nombre: form.get('nombre') as string,
      email: form.get('email') as string,
      nif: form.get('nif') as string,
      domicilio: form.get('domicilio') as string,
      razon_social: form.get('razon_social') as string,
      localidad: form.get('localidad') as string,
      provincia: form.get('provincia') as string,
      pais: form.get('pais') as string,
      telefono: form.get('telefono')
        ? Number(form.get('telefono'))
        : null,
      codigo_postal: form.get('codigo_postal')
        ? Number(form.get('codigo_postal'))
        : null
    }
    const { error } = await supabase.from('clientes').insert(nuevo)
    if (error) setError(error.message)
    else {
      setShowModal(false)
      fetchClientes()
    }
  }

  // Eliminar cliente
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) alert('Error borrando: ' + error.message)
    else      fetchClientes()
  }

  // Export CSV y PDF
  const handleExportCSV = () => {
    if (!clientes.length) return
    const headers = Object.keys(clientes[0])
    const rows = clientes.map(c =>
      headers.map(h => JSON.stringify((c as any)[h] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clientes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    doc.setFontSize(16)
    doc.text('Lista de Clientes', 40, 50)
    const startY = 80, lineH = 20
    const cols = ['Nombre','Email','NIF','Domicilio','Razón Social','Localidad','Provincia','País','Teléfono','C.Postal']
    cols.forEach((col,i) => doc.text(col, 40 + i*60, startY))
    clientes.forEach((c,rowIdx) => {
      const y = startY + lineH*(rowIdx+1)
      const vals = [
        c.nombre, c.email??'', c.nif??'', c.domicilio??'',
        c.razon_social??'', c.localidad??'', c.provincia??'',
        c.pais??'', c.telefono?.toString()??'', c.codigo_postal?.toString()??''
      ]
      vals.forEach((v,i) => doc.text(v, 40 + i*60, y))
    })
    doc.save('clientes.pdf')
  }

  return (
    <section style={{ padding: 24 }}>
      {/* — Misma cabecera */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>👥 Clientes</h1>
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
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* — Mensajes de estado */}
      {error   && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading && <p>Cargando clientes…</p>}

      {/* — Tabla igual */}
      {!loading && clientes.length > 0 ? (
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                {['Nombre','Email','NIF','Domicilio','Razón Social','Localidad','Provincia','País','Teléfono','C.Postal','Acciones']
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
              {clientes.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 8 }}>{c.nombre}</td>
                  <td style={{ padding: 8 }}>{c.email}</td>
                  <td style={{ padding: 8 }}>{c.nif}</td>
                  <td style={{ padding: 8 }}>{c.domicilio}</td>
                  <td style={{ padding: 8 }}>{c.razon_social}</td>
                  <td style={{ padding: 8 }}>{c.localidad}</td>
                  <td style={{ padding: 8 }}>{c.provincia}</td>
                  <td style={{ padding: 8 }}>{c.pais}</td>
                  <td style={{ padding: 8 }}>{c.telefono}</td>
                  <td style={{ padding: 8 }}>{c.codigo_postal}</td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => alert('Editar ' + c.nombre)}
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
                      onClick={() => handleDelete(c.id)}
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
        !loading && <p style={{ marginTop: 16 }}>No hay clientes aún.</p>
      )}

      {/* — Modal Nuevo Cliente (sin cambios de estilo) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Nuevo Cliente</h2>
            <form
              onSubmit={handleAddCliente}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'nif', label: 'NIF', type: 'text' },
                { name: 'domicilio', label: 'Domicilio', type: 'text' },
                { name: 'razon_social', label: 'Razón Social', type: 'text' },
                { name: 'localidad', label: 'Localidad', type: 'text' },
                { name: 'provincia', label: 'Provincia', type: 'text' },
                { name: 'pais', label: 'País', type: 'text' },
                { name: 'telefono', label: 'Teléfono', type: 'number' },
                { name: 'codigo_postal', label: 'Código Postal', type: 'number' }
              ].map(field => (
                <div key={field.name} className="flex flex-col">
                  <label className="mb-1 font-medium">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    required={!!field.required}
                    className="border px-2 py-1 rounded"
                  />
                </div>
              ))}
              <div className="col-span-full flex justify-end space-x-2 mt-4">
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
