// app/impuestos/page.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { FiCalendar, FiSettings } from "react-icons/fi";
import { useState, Fragment } from "react";
import Link from "next/link";

interface Impuesto {
  code: string;
  name: string;
  period: "Trimestral" | "Anual";
}

const impuestosDisponibles: Impuesto[] = [
  { code: "303", name: "Declaración de IVA", period: "Trimestral" },
  { code: "200", name: "Impuesto de sociedades", period: "Anual" },
  { code: "123", name: "Retenciones IRPF", period: "Trimestral" },
  // añade aquí los que necesites...
];

export default function ImpuestosPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="p-6 bg-white rounded-md shadow">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center text-2xl font-semibold text-gray-800">
          <FiSettings className="mr-2 text-indigo-600" />
          Impuestos
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Selecciona tus modelos
        </button>
      </header>

      {/* Lista principal */}
      <section className="space-y-4">
        {impuestosDisponibles.map((f) => (
          <div
            key={f.code}
            className="flex items-center justify-between p-4 border rounded-md hover:shadow-sm transition"
          >
            <div className="flex items-center">
              <span className="inline-block w-8 text-center font-mono mr-4">
                {f.code}
              </span>
              <span className="text-gray-700">{f.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <FiCalendar className="text-lg text-gray-500" />
              <select
                defaultValue={f.period}
                className="border rounded-md p-1"
              >
                <option>Trimestral</option>
                <option>Anual</option>
              </select>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                />
                Activar
              </label>
            </div>
          </div>
        ))}
      </section>

      {/* Modal de configuración */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
          {/* Fondo semitransparente */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* Panel */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Configurar impuestos
                  </Dialog.Title>
                  <div className="space-y-4">
                    {impuestosDisponibles.map((f) => (
                      <div key={f.code} className="flex items-center justify-between">
                        <div>
                          <span className="font-mono mr-2">{f.code}</span>
                          {f.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            defaultValue={f.period}
                            className="border rounded-md p-1"
                          >
                            <option>Trimestral</option>
                            <option>Anual</option>
                          </select>
                          <label className="inline-flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Activado
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 bg-gray-200 rounded-md mr-2 hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Guardar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </main>
  );
}
