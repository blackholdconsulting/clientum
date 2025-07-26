'use client'

import React, { useEffect, useState, Fragment } from 'react'
import {
  FiChevronDown,
  FiSearch,
  FiCalendar,
  FiDownload,
  FiSettings,
  FiPlus,
  FiMoreVertical,
} from 'react-icons/fi'
import { Menu, Transition } from '@headlessui/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type Cuenta = {
  id: number
  numero: string
  nombre: string
  grupo: string
  debe: number
  haber: number
  saldo: number
  color: string
}

export default function CuadroDeCuentasPage() {
  const supabase = createClientComponentClient<Database>()
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [filtro, setFiltro] = useState<'all' | 'withValue'>('all')
  const [busqueda, setBusqueda] = useState('')
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .order('numero')
      if (!error && data) {
        setCuentas(
          data.map((c) => ({
            ...c,
            color:
              c.color ||
              '#' + Math.floor(Math.random() * 0xffffff).toString(16),
          }))
        )
      }
    }
    load()
  }, [])

  const lista = cuentas
    .filter((c) => (filtro === 'withValue' ? c.saldo !== 0 : true))
    .filter(
      (c) =>
        c.numero.includes(busqueda) ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

  const handleExport = (type: 'csv' | 'pdf') => {
    // Aquí implementa tu lógica de exportar
    alert(`Exportar como ${type.toUpperCase()}`)
  }

  const handleNuevoAsiento = () => {
    // Navega o abre modal para crear asiento
    alert('Abrir formulario de nuevo asiento')
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Cuadro de cuentas
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Nuevo asiento */}
          <button
            onClick={handleNuevoAsiento}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
          >
            <FiPlus className="mr-2" /> Nuevo asiento
          </button>

          {/* Menú Exportar */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center bg-white border rounded px-3 py-2 hover:shadow">
              <FiDownload className="mr-2" /> Exportar
              <FiChevronDown className="ml-1" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg focus:outline-none z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleExport('csv')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      CSV
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleExport('pdf')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      PDF
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Filtro valor */}
          <button
            onClick={() =>
              setFiltro(filtro === 'all' ? 'withValue' : 'all')
            }
            className="flex items-center bg-white border rounded px-3 py-2 hover:shadow"
          >
            {filtro === 'all' ? 'Mostrar todas' : 'Con valor'}
            <FiChevronDown className="ml-2" />
          </button>

          {/* Búsqueda */}
          <div className="relative">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cuenta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-3 py-2 rounded border w-48 focus:outline-none"
            />
          </div>

          {/* Selector de fecha */}
          <div className="relative">
            <FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="01/01/2025 - 31/12/2025"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="pl-10 pr-3 py-2 rounded border w-52 focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Tabla */}
      <div className="overflow-auto bg-white rounded shadow-sm">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3"><input type="checkbox" /></th>
              <th className="p-3 text-left">Cuenta</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Grupo</th>
              <th className="p-3 text-right">Debe</th>
              <th className="p-3 text-right">Haber</th>
              <th className="p-3 text-right">Saldo</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-50 even:bg-gray-100"
              >
                <td className="p-3">
                  <input type="checkbox" />
                </td>
                <td className="p-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full block"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.numero}
                </td>
                <td className="p-3 text-blue-600 hover:underline cursor-pointer">
                  {c.nombre}
                </td>
                <td className="p-3">{c.grupo}</td>
                <td className="p-3 text-right">
                  {c.debe.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-3 text-right">
                  {c.haber.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-3 text-right font-medium">
                  {c.saldo.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-3 text-center">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <FiSettings />
                  </button>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-gray-500"
                >
                  No hay cuentas para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
