'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PlanFuturoPage() {
  const [objetivos, setObjetivos] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nuevoTexto, setNuevoTexto] = useState('')

  const abrirModal = () => {
    setNuevoTexto('')
    setIsModalOpen(true)
  }
  const cerrarModal = () => setIsModalOpen(false)
  const guardarObjetivo = () => {
    if (nuevoTexto.trim()) {
      setObjetivos((prev) => [...prev, nuevoTexto.trim()])
      cerrarModal()
    }
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
          <p className="text-gray-600 mb-4">Define tus objetivos a largo plazo.</p>
          <button
            onClick={abrirModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Añadir objetivo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            {objetivos.map((obj, idx) => (
              <li key={idx} className="text-gray-800">
                {obj}
              </li>
            ))}
          </ul>
          <button
            onClick={abrirModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Añadir otro objetivo
          </button>
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
            <textarea
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              className="w-full h-24 border rounded px-3 py-2 mb-4 resize-none"
              placeholder="Describe tu objetivo…"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
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
