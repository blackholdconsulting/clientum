// app/contabilidad/page.tsx
import Link from 'next/link'
import { FiGrid, FiBookOpen, FiTool, FiBarChart2, FiPieChart } from 'react-icons/fi'
import React from 'react'

export const metadata = {
  title: 'Contabilidad | Clientum'
}

export default function ContabilidadPage() {
  const cards = [
    {
      title: 'Cuadro de cuentas',
      href: '/contabilidad/cuadro-de-cuentas',
      icon: <FiGrid className="text-3xl text-indigo-600" />,
      description: 'Visualiza y gestiona tu plan contable'
    },
    {
      title: 'Libro diario',
      href: '/contabilidad/libro-diario',
      icon: <FiBookOpen className="text-3xl text-green-600" />,
      description: 'Registra y revisa tus asientos diarios'
    },
    {
      title: 'Activos',
      href: '/contabilidad/activos',
      icon: <FiTool className="text-3xl text-yellow-600" />,
      description: 'Gestiona tus activos y amortizaciones'
    },
    {
      title: 'Pérdidas y ganancias',
      href: '/contabilidad/perdidas-ganancias',
      icon: <FiBarChart2 className="text-3xl text-red-600" />,
      description: 'Consulta resultados de tu ejercicio'
    },
    {
      title: 'Balance de situación',
      href: '/contabilidad/balance-situacion',
      icon: <FiPieChart className="text-3xl text-blue-600" />,
      description: 'Analiza el patrimonio de la empresa'
    }
  ]

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Contabilidad</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.href}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col justify-between"
          >
            <div className="flex items-center space-x-4 mb-4">
              {card.icon}
              <h2 className="text-lg font-medium">{card.title}</h2>
            </div>
            <p className="text-sm text-gray-600 flex-1">{card.description}</p>
            <Link
              href={card.href}
              className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
            >
              Ir a {card.title}
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
