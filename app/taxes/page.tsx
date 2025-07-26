"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiCalendar, FiSettings, FiFileText } from "react-icons/fi";

const impuestosDisponibles = [
  { code: "303", name: "Declaración de IVA", period: "Trimestral" },
  { code: "349", name: "Operaciones intracomunitarias", period: "Trimestral" },
  { code: "130", name: "IRPF Trimestral", period: "Trimestral" },
  { code: "200", name: "Impuesto sobre Sociedades", period: "Anual" },
];

export default function TaxesPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="p-6 bg-white rounded-md shadow">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FiFileText className="text-2xl text-indigo-600" />
          <h1 className="text-xl font-semibold">Impuestos</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <FiSettings className="mr-1" />
            Configurar modelos
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">
            <FiCalendar className="mr-1" />
            Calendario fiscal
          </button>
        </div>
      </header>

      <section className="grid gap-4">
        {impuestosDisponibles.map((t) => (
          <div
            key={t.code}
            className="flex items-center justify-between p-4 bg-gray-50 rounded"
          >
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-500">{t.code}</span>
              <span>{t.name}</span>
            </div>
            <span className="text-gray-600">{t.period}</span>
          </div>
        ))}
      </section>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-30"
              aria-hidden="true"
            />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Configurar modelos de impuestos
                  </Dialog.Title>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {impuestosDisponibles.map((f) => (
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
                            Habilitar
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Guardar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </main>
  );
}
