// app/negocio/continuar-proyecto/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dialog } from '@headlessui/react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

type Proyecto = {
  id: number
  user_id: string
  nombre: string
  estado: string
}

export default function ContinuarProyectoPage() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null)

  // 1) Carga inicial + debug
  useEffect(() => {
    if (!session) return

    console.log('⏳ Cargando proyectos de Supabase para', session.user.id)

    supabase
      .from('proyectos')
      .select('id, user_id, nombre, estado')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error al cargar proyectos:', error)
        } else {
          console.log('✅ Proyectos recibidos:', data)
          setProyectos(data as Proyecto[] || [])
        }
      })
  }, [session, supabase])

  const handleOpenModal = (proyecto: Proyecto) => {
    setSelectedProject(proyecto)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    if (!selectedProject) return
    // redirigimos al detalle de ese proyecto
    router.push(`/negocio/proyectos/${selectedProject.id}`)
    setIsOpen(false)
    setSelectedProject(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Continuar Proyecto</h1>
      <Link
        href="/negocio/proyectos"
        className="inline-block px-4 py-2 mb-6 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
      >
        ← Volver a Proyectos
      </Link>
      <p className="mb-4 text-gray-700">
        Selecciona uno de tus proyectos y retómalo donde lo dejaste.
      </p>

      <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No tienes proyectos pendientes.
                </td>
              </tr>
            ) : (
              proyectos.map((proyecto) => (
                <tr key={proyecto.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{proyecto.id}</td>
                  <td className="px-4 py-2 border-b">{proyecto.nombre}</td>
                  <td className="px-4 py-2 border-b capitalize">{proyecto.estado}</td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => handleOpenModal(proyecto)}
                      className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                    >
                      Continuar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Confirmación */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Confirmar acción
            </Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">
              ¿Deseas continuar con el proyecto “
              <span className="font-medium">{selectedProject?.nombre}</span>
              ”?
            </Dialog.Description>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
              >
                Confirmar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

