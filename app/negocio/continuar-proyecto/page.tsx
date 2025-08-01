"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "@headlessui/react";

interface Proyecto {
  id: number;
  nombre: string;
}

export default function ContinuarProyectoPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);

  const proyectosPendientes: Proyecto[] = [
    { id: 1, nombre: "Estrategia de Expansión 2025" },
    { id: 2, nombre: "Análisis de Nuevos Mercados" },
    { id: 3, nombre: "Optimización de Procesos" },
  ];

  const handleOpenModal = (proyecto: Proyecto) => {
    setSelectedProject(proyecto);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (selectedProject) {
      console.log("Continuando proyecto", selectedProject.id);
    }
    setIsOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="p-6">
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
              <th className="px-4 py-2 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectosPendientes.map((proyecto) => (
              <tr key={proyecto.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{proyecto.id}</td>
                <td className="px-4 py-2 border-b">{proyecto.nombre}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => handleOpenModal(proyecto)}
                    className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                  >
                    Continuar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Confirmar acción
            </Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">
              {`¿Deseas continuar con el proyecto “${selectedProject?.nombre}”?`}
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
  );
}
