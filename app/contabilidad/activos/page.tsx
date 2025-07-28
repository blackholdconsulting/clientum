// app/contabilidad/activos/page.tsx
'use client'

import React, { useState } from 'react'
import { Menu } from '@headlessui/react'
import {
  FiChevronDown,
  FiUpload,
  FiPlus,
  FiDownload,
} from 'react-icons/fi'

export default function ActivosPage() {
  const [filter, setFilter] = useState<'Todos' | 'Totalmente amortizados'>('Todos')

  return (
    <main className="h-full overflow-auto bg-gray-50 p-6">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Activos</h1>
        <div className="flex flex-wrap gap-2">
          {/* Importar */}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100"
          >
            <FiUpload className="mr-2 text-lg" />
            Importar
          </button>

          {/* Exportar menu */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">
              <FiDownload className="mr-2 text-lg" />
              Exportar
              <FiChevronDown className="ml-2 text-lg" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full text-left px-4 py-2 text-gray-700`}
                  >
                    CSV
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full text-left px-4 py-2 text-gray-700`}
                  >
                    PDF
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>

          {/* Nuevo activo menu */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <FiPlus className="mr-2 text-lg" />
              Nuevo activo
              <FiChevronDown className="ml-2 text-white" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-10">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full text-left px-4 py-2 text-gray-700`}
                  >
                    Manualmente
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } w-full text-left px-4 py-2 text-gray-700`}
                  >
                    Desde factura de compra
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </header>

      {/* Filtros */}
      <section className="mb-4 flex flex-wrap items-center gap-4">
        <label htmlFor="filtro" className="sr-only">Filtrar</label>
        <select
          id="filtro"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          <option>Todos</option>
          <option>Totalmente amortizados</option>
        </select>
        <button className="text-indigo-600 hover:underline">+ Filtro</button>
      </section>

      {/* Contenido principal */}
      <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Activo</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Código</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Grupo</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 text-right">Valor</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 text-right">Amortización</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 text-right">Saldo</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Si no hay activos */}
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                No tienes activos registrados.
              </td>
            </tr>
            {/* Rellenar filas con map cuando existan datos */}
          </tbody>
        </table>
      </section>
    </main>
  )
}
