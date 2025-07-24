// app/contabilidad/balance-situacion/page.tsx
import React from 'react'
import { GiScales } from 'react-icons/gi'

export default function BalanceSituacionPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow">
      <header className="flex items-center mb-4">
        <GiScales className="text-2xl text-indigo-600 mr-2" />
        <h1 className="text-xl font-semibold">Balance de Situación</h1>
      </header>

      {/* Aquí iría tu componente o tabla con el balance */}
      <div className="text-gray-500">Aún no hay datos para mostrar.</div>
    </main>
  )
}
