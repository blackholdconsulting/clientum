// app/negocio/plan-futuro/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type ObjetivoSMART = {
  id: number
  nombre: string
  especifico: string
  medible: string
  alcanzable: string
  relevante: string
  temporal: string
  conseguido: boolean
}

export default function PlanFuturoPage() {
  const [objetivos, setObjetivos] = useState<ObjetivoSMART[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [campo, setCampo] = useState<Partial<ObjetivoSMART>>({})

  const abrirModal = () => {
    setCampo({})
    setModalAbierto(true)
  }
  const cerrarModal = () => setModalAbierto(false)

  const guardarObjetivo = () => {
    if (
      !campo.nombre?.trim() ||
      !campo.especifico?.trim() ||
      !campo.medible?.trim() ||
      !campo.alcanzable?.trim() ||
      !campo.relevante?.trim() ||
      !campo.temporal?.trim()
    ) {
      alert('Por favor, completa todos los campos SMART.')
      return
    }

    setObjetivos((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: campo.nombre!.trim(),
        especifico: campo.especifico!.trim(),
        medible: campo.medible!.trim(),
        alcanzable: campo.alcanzable!.trim(),
        relevante: campo.relevante!.trim(),
        temporal: campo.temporal!,
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
  const eliminarObjetivo = (id: number) =>
    setObjetivos((prev) => prev.filter((o) => o.id !== id))

  return (
    <main className="p-6 bg-white rounded-lg shadow-lg relative">
      {/* Header */}
      <header className="flex items-center mb-6">
        <Link href="/negocio" className="text-gray-500 hover:text-gray-700 mr-4">
          ←
        </Link>
        <h1 className="text-3xl font-bold">Plan Futuro (SMART)</h1>
      </header>

      {/* Contenido */}
      {objetivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Image
            src="/illustrations/roadmap-empty.svg"
            alt="Sin objetivos SMART"
            width={200}
            height={200}
            className="mb-6"
          />
          <p className="text-gray-600 mb-4 text-center">
            Crea objetivos profesionales bajo el método SMART: específico, medible, alcanzable,
            relevante y temporal.
          </p>
          <button
            type="button"
            onClick={abrirModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Añadir objetivo SMART
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {objetivos.map((o) => (
            <div
              key={o.id}
              className={`border rounded-lg p-4 shadow-sm ${
                o.conseguido ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <h2
                  className={`text-xl font-semibold ${
                    o.conseguido ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {o.nombre}
                </h2>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleConseguido(o.id)}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      o.conseguido
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {o.conseguido ? 'Reabrir' : 'Marcar logrado'}
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarObjetivo(o.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                <div>
                  <dt className="font-medium">Específico</dt>
                  <dd>{o.especifico}</dd>
                </div>
                <div>
                  <dt className="font-medium">Medible</dt>
                  <dd>{o.medible}</dd>
                </div>
                <div>
                  <dt className="font-medium">Alcanzable</dt>
                  <dd>{o.alcanzable}</dd>
                </div>
                <div>
                  <dt className="font-medium">Relevante</dt>
                  <dd>{o.relevante}</dd>
                </div>
                <div>
                  <dt className="font-medium">Temporal</dt>
                  <dd>{o.temporal}</dd>
                </div>
              </dl>
            </div>
          ))}
          <div className="text-right">
            <button
              type="button"
              onClick={abrirModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Añadir otro objetivo SMART
            </button>
          </div>
        </div>
      )}

      {/* Modal SMART */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nuevo Objetivo SMART</h3>
            <div className="space-y-4">
              {[
                { label: 'Nombre resumido', key: 'nombre', type: 'text' },
                { label: 'Específico', key: 'especifico', type: 'textarea' },
                { label: 'Medible', key: 'medible', type: 'textarea' },
                { label: 'Alcanzable', key: 'alcanzable', type: 'textarea' },
                { label: 'Relevante', key: 'relevante', type: 'textarea' },
                { label: 'Fecha límite', key: 'temporal', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={(campo as any)[key] || ''}
                      onChange={(e) =>
                        setCampo({ ...campo, [key]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 resize-none"
                      rows={2}
                    />
                  ) : (
                    <input
                      type={type}
                      value={(campo as any)[key] || ''}
                      onChange={(e) =>
                        setCampo({ ...campo, [key]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  )}
                </div>
              ))}
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar SMART
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
