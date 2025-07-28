'use client'

import React, { useState } from 'react'
import { Menu } from '@headlessui/react'
import { FiChevronDown, FiMoreVertical, FiSearch } from 'react-icons/fi'
import { DateRangePicker } from 'react-date-range'
import { addDays } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export default function PerdidasGananciasPage() {
  const [periodo, setPeriodo] = useState('Anual')
  const [view, setView] = useState('Cuentas')
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(new Date().getFullYear(), 11, 31),
      key: 'selection'
    }
  ])
  const [tags, setTags] = useState<string[]>([])

  return (
    <main className="h-full overflow-auto p-6 bg-gray-50">
      {/* Header */}
      <header className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Pérdidas y ganancias</h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative text-gray-500">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {/* Date range picker */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">
              {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
              <FiChevronDown className="ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <DateRangePicker
                onChange={(ranges: any) => setDateRange([ranges.selection])}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={1}
                ranges={dateRange}
                direction="vertical"
              />
            </Menu.Items>
          </Menu>
          {/* Tags filter */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">
              Añade tags para filtrar
              <FiChevronDown className="ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-56">
              {/* Aquí podrías renderizar un selector de tags real */}
              <div className="p-4 text-gray-500">Selector de tags...</div>
            </Menu.Items>
          </Menu>
          {/* Más acciones */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <FiMoreVertical />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-gray-700`}
                  >
                    Configuración
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-gray-700`}
                  >
                    Exportar informe
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </header>

      {/* Sub-filtros */}
      <section className="mb-4 flex flex-wrap items-center gap-4">
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option>Anual</option>
          <option>Mensual</option>
          <option>Trimestral</option>
        </select>
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option>Cuentas</option>
          <option>Grupos</option>
          <option>Resumen</option>
        </select>
      </section>

      {/* Gráfico / placeholder */}
      <div className="mb-6 h-40 bg-gray-100 rounded-md" />

      {/* Tabla de resultados */}
      <section className="overflow-x-auto bg-white border border-gray-200 rounded-md shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Concepto</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              'Resultado de explotación',
              'Resultado financiero',
              'Resultado antes de impuestos',
              'Resultado del ejercicio'
            ].map((label) => (
              <tr key={label}>
                <td className="px-6 py-4 text-gray-800">{label}</td>
                <td className="px-6 py-4 text-right text-gray-800">0,00</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-gray-500 text-sm">
          Mostrando 1 a 4 de 4 entradas
        </div>
      </section>
    </main>
  )
}
