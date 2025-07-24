'use client'

import React from 'react'
import { FiBarChart2 } from 'react-icons/fi'

export default function CuadroDeCuentasPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4 flex items-center">
        <FiBarChart2 className="mr-2 text-indigo-600" /> Cuadro de cuentas
      </h1>
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">No hay cuentas en este periodo.</p>
      </div>
    </main>
  )
}
