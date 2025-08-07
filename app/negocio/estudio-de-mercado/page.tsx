// app/negocio/estudio-de-mercado/page.tsx
'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { Tab } from '@headlessui/react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

type Vision = {
  objetivo: string
  alcance: string
  metodologia: string
}
type Segmentacion = {
  demografica: string
  geografica: string
  psicografica: string
  conductual: string
}
type Tamano = {
  mercadoTotal: string
  mercadoServible: string
  mercadoObtenible: string
}
type Tendencias = {
  tecnologicas: string
  economicas: string
  sociales: string
  regulatorias: string
}

export default function EstudioMercadoPage() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const sections = [
    'Visión General',
    'Segmentación',
    'Tamaño de Mercado',
    'Tendencias',
    'Conclusiones',
  ] as const
  const [active, setActive] = useState<typeof sections[number]>('Visión General')

  // estados locales
  const [vision, setVision] = useState<Vision>({
    objetivo: '',
    alcance: '',
    metodologia: '',
  })
  const [segmentacion, setSegmentacion] = useState<Segmentacion>({
    demografica: '',
    geografica: '',
    psicografica: '',
    conductual: '',
  })
  const [tamano, setTamano] = useState<Tamano>({
    mercadoTotal: '',
    mercadoServible: '',
    mercadoObtenible: '',
  })
  const [tendencias, setTendencias] = useState<Tendencias>({
    tecnologicas: '',
    economicas: '',
    sociales: '',
    regulatorias: '',
  })
  const [conclusiones, setConclusiones] = useState('')

  // Carga inicial desde Supabase
  useEffect(() => {
    if (!session) return
    supabase
      .from('estudio_mercado')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error(error)
          return
        }
        if (data) {
          setVision({
            objetivo: data.objetivo_general || '',
            alcance: data.alcance || '',
            metodologia: data.metodologia || '',
          })
          setSegmentacion({
            demografica: data.segment_demografica || '',
            geografica: data.segment_geografica || '',
            psicografica: data.segment_psicografica || '',
            conductual: data.segment_conductual || '',
          })
          setTamano({
            mercadoTotal: data.tam_tam || '',
            mercadoServible: data.tam_sam || '',
            mercadoObtenible: data.tam_som || '',
          })
          setTendencias({
            tecnologicas: data.tend_tecnologicas || '',
            economicas: data.tend_economicas || '',
            sociales: data.tend_sociales || '',
            regulatorias: data.tend_regulatorias || '',
          })
          setConclusiones(data.conclusiones || '')
        }
      })
  }, [session, supabase])

  // Guarda todos los campos en Supabase (upsert)
  const guardarCambios = async () => {
    if (!session) return
    const payload = {
      user_id: session.user.id,
      objetivo_general: vision.objetivo,
      alcance: vision.alcance,
      metodologia: vision.metodologia,
      segment_demografica: segmentacion.demografica,
      segment_geografica: segmentacion.geografica,
      segment_psicografica: segmentacion.psicografica,
      segment_conductual: segmentacion.conductual,
      tam_tam: tamano.mercadoTotal,
      tam_sam: tamano.mercadoServible,
      tam_som: tamano.mercadoObtenible,
      tend_tecnologicas: tendencias.tecnologicas,
      tend_economicas: tendencias.economicas,
      tend_sociales: tendencias.sociales,
      tend_regulatorias: tendencias.regulatorias,
      conclusiones,
    }
    const { error } = await supabase
      .from('estudio_mercado')
      .upsert(payload, { onConflict: 'user_id' })
    if (error) {
      console.error(error)
      alert('Error al guardar. Revisa la consola.')
    } else {
      alert('Estudio de Mercado guardado correctamente.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold text-indigo-700">Estudio de Mercado</h1>

      <Tab.Group
        selectedIndex={sections.indexOf(active)}
        onChange={(i) => setActive(sections[i])}
      >
        <Tab.List className="flex space-x-2 border-b">
          {sections.map((sec) => (
            <Tab key={sec} as={Fragment}>
              {({ selected }) => (
                <button
                  className={classNames(
                    'py-2 px-4 -mb-px font-medium',
                    selected
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  )}
                >
                  {sec}
                </button>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="pt-6 space-y-6">
          {/* Visión General */}
          <Tab.Panel>
            <div className="space-y-4">
              <label className="block">
                <span className="font-semibold">Objetivo del estudio</span>
                <textarea
                  rows={3}
                  value={vision.objetivo}
                  onChange={(e) =>
                    setVision({ ...vision, objetivo: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold">Alcance y cobertura</span>
                <textarea
                  rows={2}
                  value={vision.alcance}
                  onChange={(e) =>
                    setVision({ ...vision, alcance: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold">Metodología</span>
                <textarea
                  rows={2}
                  value={vision.metodologia}
                  onChange={(e) =>
                    setVision({ ...vision, metodologia: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                />
              </label>
            </div>
          </Tab.Panel>

          {/* Segmentación */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Object.keys(segmentacion) as Array<keyof Segmentacion>).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={3}
                    value={segmentacion[key]}
                    onChange={(e) =>
                      setSegmentacion({ ...segmentacion, [key]: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                  />
                </label>
              ))}
            </div>
          </Tab.Panel>

          {/* Tamaño de Mercado */}
          <Tab.Panel>
            <div className="space-y-4">
              <label className="block">
                <span className="font-semibold">Mercado Total (TAM)</span>
                <input
                  type="text"
                  value={tamano.mercadoTotal}
                  onChange={(e) =>
                    setTamano({ ...tamano, mercadoTotal: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold">Mercado Servible (SAM)</span>
                <input
                  type="text"
                  value={tamano.mercadoServible}
                  onChange={(e) =>
                    setTamano({ ...tamano, mercadoServible: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                />
              </label>
              <label className="block">
                <span className="font-semibold">Mercado Obtenible (SOM)</span>
                <input
                  type="text"
                  value={tamano.mercadoObtenible}
                  onChange={(e) =>
                    setTamano({ ...tamano, mercadoObtenible: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                />
              </label>
            </div>
          </Tab.Panel>

          {/* Tendencias */}
          <Tab.Panel>
            <div className="space-y-4">
              {(Object.keys(tendencias) as Array<keyof Tendencias>).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={3}
                    value={tendencias[key]}
                    onChange={(e) =>
                      setTendencias({ ...tendencias, [key]: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                  />
                </label>
              ))}
            </div>
          </Tab.Panel>

          {/* Conclusiones */}
          <Tab.Panel>
            <label className="block">
              <span className="font-semibold">Conclusiones clave</span>
              <textarea
                rows={5}
                value={conclusiones}
                onChange={(e) => setConclusiones(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              />
            </label>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Botón Guardar */}
      <div className="pt-6 border-t text-right">
        <button
          type="button"
          onClick={guardarCambios}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
