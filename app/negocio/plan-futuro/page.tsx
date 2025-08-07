// app/negocio/plan-futuro/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

type ObjetivoSMART = {
  id: number
  user_id: string
  nombre: string
  especifico: string
  medible: string
  alcanzable: string
  relevante: string
  temporal: string
  conseguido: boolean
  created_at: string
  updated_at: string
}

export default function PlanFuturoPage() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const [objetivos, setObjetivos] = useState<ObjetivoSMART[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [campo, setCampo] = useState<Partial<ObjetivoSMART>>({})

  // 1) Carga inicial de objetivos desde Supabase
  useEffect(() => {
    if (!session) return
    supabase
      .from<'objetivos_smart', ObjetivoSMART>('objetivos_smart')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error)
        } else if (data) {
          setObjetivos(data)
        }
      })
  }, [session, supabase])

  const abrirModal = () => {
    setCampo({})
    setModalAbierto(true)
  }
  const cerrarModal = () => setModalAbierto(false)

  // 2) Guarda en Supabase y en estado local
  const guardarObjetivo = async () => {
    const { nombre, especifico, medible, alcanzable, relevante, temporal } = campo
    if (
      !nombre ||
      !especifico ||
      !medible ||
      !alcanzable ||
      !relevante ||
      !temporal
    ) {
      alert('Completa todos los campos SMART.')
      return
    }
    const { data, error } = await supabase
      .from<'objetivos_smart', ObjetivoSMART>('objetivos_smart')
      .insert({
        user_id: session!.user.id,
        nombre,
        especifico,
        medible,
        alcanzable,
        relevante,
        temporal
      })
      .select('*')
      .single()

    if (error) {
      console.error(error)
    } else if (data) {
      setObjetivos((prev) => [data, ...prev])
      cerrarModal()
    }
  }

  // 3) Actualiza “conseguido” en Supabase
  const toggleConseguido = async (id: number, actual: boolean) => {
    const { data, error } = await supabase
      .from<'objetivos_smart', ObjetivoSMART>('objetivos_smart')
      .update({ conseguido: !actual })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error(error)
    } else if (data) {
      setObjetivos((prev) => prev.map((o) => (o.id === id ? data : o)))
    }
  }

  // 4) Elimina objetivo en Supabase
  const eliminarObjetivo = async (id: number) => {
    const { error } = await supabase
      .from<'objetivos_smart', ObjetivoSMART>('objetivos_smart')
      .delete()
      .eq('id', id)

    if (!error) {
      setObjetivos((prev) => prev.filter((o) => o.id !== id))
    } else {
      console.error(error)
    }
  }

  return (
    <main className="p-6 bg-white rounded-lg shadow-lg relative">
      {/* Header */}
      <header className="flex items-center mb-6">
        <Link href="/negocio" className="text-gray-500 hover:text-gray-700 mr-4">
          ←
        </Link>
        <h1 className="text-3xl font-bold">Plan Futuro SMART</h1>
      </header>

      {/* Lista o ilustración */}
      {objetivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Image
            src="/illustrations/roadmap-empty.svg"
            alt="Sin objetivos"
            width={200}
            height={200}
            className="mb-6"
          />
          <p className="text-gray-600 mb-4 text-center">
            Crea objetivos SMART y gestiona tu progreso.
          </p>
          <button
            type="button"
            onClick={abrirModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Añadir objetivo SMART
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {objetivos.map((o) => (
            <div
              key={o.id}
              className={`border rounded-lg p-4 shadow-sm ${
                o.conseguido ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <h2
                  className={`text-xl font-semibold ${
                    o.conseguido ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {o.nombre}
                </h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleConseguido(o.id, o.conseguido)}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      o.conseguido
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {o.conseguido ? 'Reabrir' : 'Marcar logrado'}
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarObjetivo(o.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
                <div>
                  <dt className="font-medium">Específico</dt>
                  <dd>{o.especifico}</dd>
                </div>
                <div>
                  <dt className="font-medium">Medible</dt>
                  <dd>{o.medible}</dd>
                </div>
                <div>
                  <dt className="font-medium">Alcanzable</dt>
                  <dd>{o.alcanzable}</dd>
                </div>
                <div>
                  <dt className="font-medium">Relevante</dt>
                  <dd>{o.relevante}</dd>
                </div>
                <div>
                  <dt className="font-medium">Plazo</dt>
                  <dd>{o.temporal}</dd>
                </div>
              </dl>
            </div>
          ))}
          <div className="text-right">
            <button
              type="button"
              onClick={abrirModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Añadir otro objetivo SMART
            </button>
          </div>
        </div>
      )}

      {/* Modal SMART */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nuevo Objetivo SMART</h3>
            <div className="space-y-4">
              {[
                { label: 'Nombre resumido', key: 'nombre', type: 'text' },
                { label: 'Específico', key: 'especifico', type: 'textarea' },
                { label: 'Medible', key: 'medible', type: 'textarea' },
                { label: 'Alcanzable', key: 'alcanzable', type: 'textarea' },
                { label: 'Relevante', key: 'relevante', type: 'textarea' },
                { label: 'Fecha límite', key: 'temporal', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={(campo as any)[key] || ''}
                      onChange={(e) =>
                        setCampo({ ...campo, [key]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 resize-none"
                      rows={2}
                    />
                  ) : (
                    <input
                      type={type}
                      value={(campo as any)[key] || ''}
                      onChange={(e) =>
                        setCampo({ ...campo, [key]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarObjetivo}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Guardar SMART
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
