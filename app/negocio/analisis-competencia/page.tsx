// app/negocio/analisis-de-competencia/page.tsx
'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { Tab } from '@headlessui/react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Tipos para persistencia
type Analisis = {
  user_id: string
  fortalezas: string
  debilidades: string
  oportunidades: string
  amenazas: string
  politico: string
  economico: string
  social: string
  tecnologico: string
  ambiental: string
  legal: string
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

  // Estado DAFO
  const [dafo, setDafo] = useState({
    fortalezas: '',
    debilidades: '',
    oportunidades: '',
    amenazas: '',
  })
  // Estado PEST
  const [pest, setPest] = useState({
    politico: '',
    economico: '',
    social: '',
    tecnologico: '',
  })
  // Estado PESTEL
  const [pestel, setPestel] = useState({
    politico: '',
    economico: '',
    social: '',
    tecnologico: '',
    ambiental: '',
    legal: '',
  })
  // Competidores
  const [competidores, setCompetidores] = useState<Competitor[]>([])

  // 1) Carga inicial de DAFO/PEST/PESTEL y Competidores
  useEffect(() => {
    if (!session) return

    // DAFO/PEST/PESTEL
    supabase
      .from<Analisis>('analisis_competencia')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error(error)
        } else if (data) {
          setDafo({
            fortalezas: data.fortalezas,
            debilidades: data.debilidades,
            oportunidades: data.oportunidades,
            amenazas: data.amenazas,
          })
          setPest({
            politico: data.politico,
            economico: data.economico,
            social: data.social,
            tecnologico: data.tecnologico,
          })
          setPestel({
            politico: data.politico,
            economico: data.economico,
            social: data.social,
            tecnologico: data.tecnologico,
            ambiental: data.ambiental,
            legal: data.legal,
          })
        }
      })

    // Competidores
    supabase
      .from<Competitor>('competidores')
      .select('*')
      .eq('user_id', session.user.id)
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setCompetidores(data || [])
      })
  }, [session, supabase])

  // 2) Upsert DAFO/PEST/PESTEL en un único payload
  const guardarAnalisis = async () => {
    if (!session) return
    const payload = {
      user_id: session.user.id,
      ...dafo,
      ...pestel, // PESTEL repite campos politico/economico/social/tecnologico
    }
    const { error } = await supabase
      .from('analisis_competencia')
      .upsert(payload, { onConflict: 'user_id' })
    if (error) {
      console.error(error)
      alert('Error al guardar el análisis.')
    } else {
      alert('Análisis de competencia actualizado.')
    }
  }

  // 3) Competidores: add / update / delete
  const addCompetitor = async () => {
    if (!session) return
    const { data, error } = await supabase
      .from('competidores')
      .insert({ user_id: session.user.id })
      .select('*')
      .single()
    if (error) console.error(error)
    else setCompetidores((prev) => [...prev, data])
  }

  const updateCompetitor = async (
    id: number,
    field: keyof Omit<Competitor, 'id' | 'user_id'>,
    value: string
  ) => {
    const { data, error } = await supabase
      .from('competidores')
      .update({ [field]: value })
      .eq('id', id)
      .select('*')
      .single()
    if (error) console.error(error)
    else
      setCompetidores((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      )
  }

  const removeCompetitor = async (id: number) => {
    const { error } = await supabase
      .from('competidores')
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
        <Tab.List className="flex space-x-4 border-b">
          {tabs.map((tab) => (
            <Tab key={tab} as={Fragment}>
              {({ selected }) => (
                <button
                  className={classNames(
                    'py-2 px-4 font-medium -mb-px',
                    selected
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['fortalezas','debilidades','oportunidades','amenazas'] as const).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={3}
                    value={(dafo as any)[key]}
                    onChange={(e) =>
                      setDafo({ ...dafo, [key]: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                  />
                </label>
              ))}
            </div>
          </Tab.Panel>

          {/* PEST */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['politico','economico','social','tecnologico'] as const).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={2}
                    value={(pest as any)[key]}
                    onChange={(e) =>
                      setPest({ ...pest, [key]: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                  />
                </label>
              ))}
            </div>
          </Tab.Panel>

          {/* PESTEL */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['politico','economico','social','tecnologico','ambiental','legal'] as const).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={2}
                    value={(pestel as any)[key]}
                    onChange={(e) =>
                      setPestel({ ...pestel, [key]: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                  />
                </label>
              ))}
            </div>
          </Tab.Panel>

          {/* Competidores */}
          <Tab.Panel>
            <div className="flex justify-between mb-4">
              <span className="font-medium">Tus competidores</span>
              <button
                type="button"
                onClick={addCompetitor}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                + Añadir
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
                    <th className="border px-2 py-1">Acc</th>
                  </tr>
                </thead>
                <tbody>
                  {competidores.map((c) => (
                    <tr key={c.id}>
                      {(['nombre','precio','ubicacion','fortalezas','debilidades'] as const).map((f) => (
                        <td key={f} className="border px-2 py-1">
                          <input
                            type="text"
                            value={(c as any)[f]}
                            onChange={(e) =>
                              updateCompetitor(c.id, f, e.target.value)
                            }
                            className="w-full border rounded px-1 py-0.5"
                          />
                        </td>
                      ))}
                      <td className="border px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeCompetitor(c.id)}
                          className="text-red-600 hover:underline"
                        >
                          Elim.
                        </button>
                      </td>
                    </tr>
                  ))}
                  {competidores.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No hay competidores aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Botón Guardar Análisis */}
      <div className="pt-6 border-t text-right">
        <button
          type="button"
          onClick={guardarAnalisis}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Guardar Análisis DAFO/PEST/PESTEL
        </button>
      </div>
    </div>
  )
}
