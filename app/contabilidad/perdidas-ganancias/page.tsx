'use client'

import React from 'react'
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi'

export default function PerdidasYGananciasPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4 flex items-center">
        <FiTrendingDown className="mr-2 text-red-500" />
        <FiTrendingUp className="mr-2 text-green-500" />
        Pérdidas y ganancias
      </h1>
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">No hay datos para este informe.</p>
      </div>
    </main>
  )
}
