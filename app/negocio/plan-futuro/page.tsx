// app/negocio/plan-futuro/page.tsx
'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Objetivo = {
  id: number
  texto: string
  plazo: string
  conseguido: boolean
}

export default function PlanFuturoPage() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nuevoTexto, setNuevoTexto] = useState('')
  const [nuevoPlazo, setNuevoPlazo] = useState('')

  const abrirModal = () => {
    setNuevoTexto('')
    setNuevoPlazo('')
    setIsModalOpen(true)
  }
  const cerrarModal = () => setIsModalOpen(false)

  const guardarObjetivo = () => {
    if (!nuevoTexto.trim() || !nuevoPlazo) return
    setObjetivos((prev) => [
      ...prev,
      {
        id: Date.now(),
        texto: nuevoTexto.trim(),
        plazo: nuevoPlazo,
        conseguido: false,
      },
    ])
    cerrarModal()
  }

  const toggleConseguido = (id: number) => {
    setObjetivos((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, conseguido: !o.conseguido } : o
      )
    )
  }

  const eliminarObjetivo = (id: number) => {
    setObjetivos((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <main className="p-6 bg-white rounded-md shadow-lg relative">
      {/* Header */}
      <header className="flex items-center mb-6">
        <Link href="/negocio" className="text-gray-500 hover:text-gray-700 mr-4">
          ←
        </Link>
        <h1 className="text-2xl font-semibold">Plan futuro</h1>
      </header>

      {/* Contenido */}
      {objetivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Image
            src="/illustrations/roadmap-empty.svg"
            alt="Sin plan futuro"
            width={192}
            height={192}
            className="mb-6"
          />
          <p className="text-gray-600 mb-4">
            Define tus objetivos a largo plazo con plazos y controla su estado.
          </p>
          <button
            type="button"
            onClick={abrirModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Añadir objetivo
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Objetivo</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Plazo</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {objetivos.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className={`px-4 py-2 text-sm ${o.conseguido ? 'line-through text-gray-400' : ''}`}>
                    {o.texto}
                  </td>
                  <td className="px-4 py-2 text-sm">{o.plazo}</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        o.conseguido ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {o.conseguido ? 'Conseguido' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleConseguido(o.id)}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
                    >
                      {o.conseguido ? 'Reabrir' : 'Marcar logrado'}
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarObjetivo(o.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={abrirModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Añadir otro objetivo
            </button>
          </div>
        </div>
      )}

      {/* Enlace al artículo */}
      <div className="mt-8 bg-white border rounded-md p-4 flex items-center justify-between">
        <span className="text-gray-700">Aprende a trazar tu hoja de ruta estratégica.</span>
        <Link href="/articulo/trazar-hoja-de-ruta" className="text-sm text-blue-600 hover:underline">
          Leer artículo
        </Link>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold mb-4">Nuevo objetivo</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={nuevoTexto}
                  onChange={(e) => setNuevoTexto(e.target.value)}
                  className="w-full border rounded px-3 py-2 resize-none"
                  rows={3}
                  placeholder="Describe tu objetivo…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plazo</label>
                <input
                  type="date"
                  value={nuevoPlazo}
                  onChange={(e) => setNuevoPlazo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarObjetivo}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
