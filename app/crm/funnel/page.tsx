// app/crm/funnel/page.tsx
import React from 'react'

const STAGES = [
  { key: 'lead', label: 'Lead' },
  { key: 'contactado', label: 'Contacto establecido' },
  { key: 'necesidades', label: 'Necesidades definidas' },
  { key: 'propuesta', label: 'Propuesta realizada' },
  { key: 'negociacion', label: 'Negociaciones' },
]

export default function FunnelPage() {
  // Aquí más tarde puedes cargar datos reales con Supabase...
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Embudo de ventas</h1>
      <div className="flex space-x-4 overflow-x-auto">
        {STAGES.map((s) => (
          <div key={s.key} className="flex-shrink-0 w-64 bg-white rounded shadow p-4">
            <h2 className="font-semibold text-gray-700">{s.label}</h2>
            <p className="mt-2 text-2xl font-bold text-indigo-600">0 €</p>
            <p className="text-gray-500">0 oportunidades</p>
          </div>
        ))}
      </div>
    </>
  )
}
