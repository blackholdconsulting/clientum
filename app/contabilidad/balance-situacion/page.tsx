'use client'

import React from 'react'
import { FiScale } from 'react-icons/fi'

export default function BalanceSituacionPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4 flex items-center">
        <FiScale className="mr-2 text-indigo-600" /> Balance de situación
      </h1>
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Sin partidas para este balance.</p>
      </div>
    </main>
  )
}
