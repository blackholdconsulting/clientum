// app/taxes/page.tsx
"use client"

import { useState, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { FiCalendar, FiSettings, FiPlus } from "react-icons/fi"
import classNames from "clsx"

const TAX_FORMS = [
  { code: "303", name: "Declaración de IVA", period: "Trimestral" },
  { code: "111", name: "IRPF Retenciones", period: "Trimestral" },
  { code: "200", name: "Impuesto sobre Sociedades", period: "Anual" },
  // …otros formularios
]

export default function TaxesPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <main className="flex-1 p-6 bg-gray-50">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Impuestos</h1>
        <div className="space-x-2">
          <button className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-gray-100 transition">
            <FiCalendar className="mr-2" /> Calendario fiscal
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <FiPlus className="mr-2" /> Selecciona tus modelos
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center">
        <div className="flex-1 mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">Modelos de impuestos</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Selecciona los modelos de impuestos para tus obligaciones</li>
            <li>Completa y controla los modelos activados</li>
            <li>Envía automáticamente los modelos a la AEAT</li>
          </ul>
        </div>
        <div>
          <img
            src="/images/taxes-hero.svg"
            alt="Impuestos"
            className="w-48 h-auto mx-auto"
          />
        </div>
      </section>

      {/* Resumen de impuestos */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Resumen de modelos</h3>
        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th className="py-2">Formulario</th>
              <th className="py-2">Descripción</th>
              <th className="py-2">Periodo</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {TAX_FORMS.map((f) => (
              <tr key={f.code} className="border-b last:border-0">
                <td className="py-2 font-mono text-sm">{f.code}</td>
                <td className="py-2">{f.name}</td>
                <td className="py-2">{f.period}</td>
                <td className="py-2">
                  <span
                    className={classNames(
                      "inline-block px-2 py-1 rounded-full text-xs",
                      "bg-gray-200 text-gray-800"
                    )}
                  >
                    Inactivo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal de configuración (HeadlessUI) */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <Dialog.Title as="h2" className="text-xl font-semibold mb-4">
                  Configuración de Modelos
                </Dialog.Title>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {TAX_FORMS.map((f) => (
                    <div
                      key={f.code}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono mr-2">{f.code}</span>
                        {f.name}
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          defaultValue={f.period}
                          className="border rounded-md p-1"
                        >
                          <option>Trimestral</option>
                          <option>Anual</option>
                        </select>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <FiSettings />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-right">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </main>
  )
}
