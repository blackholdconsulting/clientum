// app/negocio/analisis-competencia/page.tsx
'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { Tab } from '@headlessui/react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

type Competitor = {
  id: number
  user_id: string
  nombre: string
  precio: string
  ubicacion: string
  fortalezas: string
  debilidades: string
}

export default function AnalisisCompetenciaPage() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const tabs = ['DAFO', 'PEST', 'PESTEL', 'Competidores'] as const
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('DAFO')

  // DAFO / PEST / PESTEL state omitted for brevity…

  // Competitors
  const [competidores, setCompetidores] = useState<Competitor[]>([])

  // 1) Cargar competidores del usuario
  useEffect(() => {
    if (!session) return
    supabase
      .from<'competidores', Competitor>('competidores')
      .select('*')
      .eq('user_id', session.user.id)
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else if (data) setCompetidores(data)
      })
  }, [session, supabase])

  // 2) Añadir nuevo competidor
  const addCompetitor = async () => {
    if (!session) return
    const { data, error } = await supabase
      .from<'competidores', Competitor>('competidores')
      .insert({
        user_id: session.user.id,
        nombre: '',
        precio: '',
        ubicacion: '',
        fortalezas: '',
        debilidades: '',
      })
      .select('*')
      .single()
    if (error) console.error(error)
    else if (data) setCompetidores((prev) => [...prev, data])
  }

  // 3) Actualizar campo de competidor
  const updateCompetitor = async (
    id: number,
    field: keyof Omit<Competitor, 'id' | 'user_id'>,
    value: string
  ) => {
    const { data, error } = await supabase
      .from<'competidores', Competitor>('competidores')
      .update({ [field]: value })
      .eq('id', id)
      .select('*')
      .single()
    if (error) console.error(error)
    else if (data) {
      setCompetidores((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      )
    }
  }

  // 4) Eliminar competidor
  const removeCompetitor = async (id: number) => {
    const { error } = await supabase
      .from<'competidores', Competitor>('competidores')
      .delete()
      .eq('id', id)
    if (error) console.error(error)
    else setCompetidores((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Análisis de la Competencia</h1>

      <Tab.Group
        selectedIndex={tabs.indexOf(activeTab)}
        onChange={(i) => setActiveTab(tabs[i])}
      >
        <Tab.List className="flex space-x-2 border-b">
          {tabs.map((tab) => (
            <Tab key={tab} as={Fragment}>
              {({ selected }) => (
                <button
                  className={classNames(
                    'py-2 px-4 -mb-px font-medium',
                    selected
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="pt-6">
          {/* DAFO */}
          <Tab.Panel>
            {/* … tu UI de DAFO … */}
          </Tab.Panel>

          {/* PEST */}
          <Tab.Panel>
            {/* … tu UI de PEST … */}
          </Tab.Panel>

          {/* PESTEL */}
          <Tab.Panel>
            {/* … tu UI de PESTEL … */}
          </Tab.Panel>

          {/* Competidores */}
          <Tab.Panel>
            <div className="mb-4">
              <button
                type="button"
                onClick={addCompetitor}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                + Añadir Competidor
              </button>
            </div>
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Nombre</th>
                    <th className="border px-2 py-1">Precio</th>
                    <th className="border px-2 py-1">Ubicación</th>
                    <th className="border px-2 py-1">Fortalezas</th>
                    <th className="border px-2 py-1">Debilidades</th>
                    <th className="border px-2 py-1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {competidores.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No tienes competidores aún.
                      </td>
                    </tr>
                  )}
                  {competidores.map((c) => (
                    <tr key={c.id}>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={c.nombre}
                          onChange={(e) =>
                            updateCompetitor(c.id, 'nombre', e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={c.precio}
                          onChange={(e) =>
                            updateCompetitor(c.id, 'precio', e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={c.ubicacion}
                          onChange={(e) =>
                            updateCompetitor(c.id, 'ubicacion', e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={c.fortalezas}
                          onChange={(e) =>
                            updateCompetitor(c.id, 'fortalezas', e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={c.debilidades}
                          onChange={(e) =>
                            updateCompetitor(c.id, 'debilidades', e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeCompetitor(c.id)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
