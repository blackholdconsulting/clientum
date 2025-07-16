'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Gasto {
  id: string
  user_id: string
  fecha: string
  categoria: string
  descripcion: string
  importe: number
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // filtros
  const [filDesde, setFilDesde] = useState('')
  const [filHasta, setFilHasta] = useState('')
  const [filCategoria, setFilCategoria] = useState('')

  // nuevo gasto
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [nuevoImporte, setNuevoImporte] = useState(0)

  // editar
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const PAGE_SIZE = 10

  async function loadGastos() {
    setLoading(true)
    let q = supabase
      .from<Gasto>('gastos')
      .select('*', { count: 'exact' })
      .order('fecha', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (filDesde) q = q.gte('fecha', filDesde)
    if (filHasta) q = q.lte('fecha', filHasta)
    if (filCategoria) q = q.eq('categoria', filCategoria)

    const { data, error, count } = await q
    if (error) console.error(error)
    else {
      setGastos(data || [])
      setTotalPages(count ? Math.ceil(count / PAGE_SIZE) : 1)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGastos()
  }, [page])

  async function handleFiltrar(e: FormEvent) {
    e.preventDefault()
    setPage(1)
    await loadGastos()
  }

  async function handleNueva(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase
      .from('gastos')
      .insert([
        {
          fecha: nuevaFecha,
          categoria: nuevaCategoria,
          descripcion: nuevaDescripcion,
          importe: nuevoImporte,
        },
      ])
    if (error) console.error(error)
    else {
      // limpiar form
      setNuevaFecha('')
      setNuevaCategoria('')
      setNuevaDescripcion('')
      setNuevoImporte(0)
      setPage(1)
      await loadGastos()
    }
  }

  async function onEdit(g: Gasto) {
    setEditandoId(g.id)
    setNuevaFecha(g.fecha)
    setNuevaCategoria(g.categoria)
    setNuevaDescripcion(g.descripcion)
    setNuevoImporte(g.importe)
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editandoId) return
    const { error } = await supabase
      .from('gastos')
      .update({
        fecha: nuevaFecha,
        categoria: nuevaCategoria,
        descripcion: nuevaDescripcion,
        importe: nuevoImporte,
      })
      .eq('id', editandoId)
    if (error) console.error(error)
    else {
      setEditandoId(null)
      // limpiar form
      setNuevaFecha('')
      setNuevaCategoria('')
      setNuevaDescripcion('')
      setNuevoImporte(0)
      await loadGastos()
    }
  }

  async function delGasto(id: string) {
    if (!confirm('¿Borrar este gasto?')) return
    const { error } = await supabase.from('gastos').delete().eq('id', id)
    if (error) console.error(error)
    else await loadGastos()
  }

  function exportCSV() {
    const header = ['fecha', 'categoria', 'descripcion', 'importe']
    const rows = gastos.map(g => [
      g.fecha,
      g.categoria,
      g.descripcion,
      g.importe.toString(),
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gastos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gastos</h1>

      <form onSubmit={handleFiltrar} className="flex gap-2 mb-4">
        <input
          type="date"
          value={filDesde}
          onChange={e => setFilDesde(e.target.value)}
        />
        <input
          type="date"
          value={filHasta}
          onChange={e => setFilHasta(e.target.value)}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={filCategoria}
          onChange={e => setFilCategoria(e.target.value)}
        />
        <button type="submit" className="btn">
          Aplicar
        </button>
        <button type="button" onClick={exportCSV} className="btn">
          Exportar CSV
        </button>
      </form>

      <form
        onSubmit={editandoId ? handleUpdate : handleNueva}
        className="flex gap-2 mb-4"
      >
        <input
          type="date"
          required
          value={nuevaFecha}
          onChange={e => setNuevaFecha(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Categoría"
          value={nuevaCategoria}
          onChange={e => setNuevaCategoria(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Descripción"
          value={nuevaDescripcion}
          onChange={e => setNuevaDescripcion(e.target.value)}
        />
        <input
          type="number"
          required
          placeholder="Importe"
          value={nuevoImporte}
          onChange={e => setNuevoImporte(Number(e.target.value))}
        />
        <button type="submit" className="btn">
          {editandoId ? 'Guardar' : 'Nuevo gasto'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={() => setEditandoId(null)}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        )}
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Fecha</th>
            <th className="border px-2 py-1">Categoría</th>
            <th className="border px-2 py-1">Descripción</th>
            <th className="border px-2 py-1">Importe (€)</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map(g => (
            <tr key={g.id}>
              <td className="border px-2 py-1">{g.fecha}</td>
              <td className="border px-2 py-1">{g.categoria}</td>
              <td className="border px-2 py-1">{g.descripcion}</td>
              <td className="border px-2 py-1">{g.importe.toFixed(2)}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  onClick={() => onEdit(g)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => delGasto(g.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {gastos.length === 0 && !loading && (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No hay gastos.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="btn"
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="btn"
        >
          Siguiente
        </button>
      </div>
    </div>
)
}
