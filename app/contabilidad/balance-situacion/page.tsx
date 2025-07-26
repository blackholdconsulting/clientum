// app/contabilidad/balance-situacion/page.tsx
'use client'

import React from 'react'
import { FaBalanceScale } from 'react-icons/fa'

export default function BalanceSituacionPage() {
  return (
    <main className="p-6 max-w-5xl mx-auto bg-white rounded-md shadow-sm">
      {/* Cabecera */}
      <header className="flex items-center mb-6">
        <FaBalanceScale className="text-indigo-600 mr-3" size={30} />
        <h1 className="text-3xl font-semibold text-gray-800">
          Balance de Situación
        </h1>
      </header>

      {/* Contenido principal */}
      <section className="space-y-4">
        <p className="text-gray-600">
          Aquí puedes revisar la situación patrimonial de tu empresa.
        </p>
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border-b">Cuenta</th>
              <th className="p-2 border-b">Activo</th>
              <th className="p-2 border-b">Pasivo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">Caja</td>
              <td className="p-2 border-b">10 000 €</td>
              <td className="p-2 border-b">—</td>
            </tr>
            <tr>
              <td className="p-2 border-b">Bancos</td>
              <td className="p-2 border-b">25 000 €</td>
              <td className="p-2 border-b">—</td>
            </tr>
            <tr>
              <td className="p-2 border-b">Proveedores</td>
              <td className="p-2 border-b">—</td>
              <td className="p-2 border-b">7 500 €</td>
            </tr>
            {/* … más filas … */}
          </tbody>
        </table>
      </section>
    </main>
  )
}
