"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { FiSettings, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Link from "next/link";

interface Impuesto {
  code: string;
  name: string;
  period: string;
}

const IMPUESTOS: Impuesto[] = [
  { code: "303", name: "Declaración de IVA", period: "Trimestral" },
  { code: "349", name: "Operaciones intracomunitarias", period: "Trimestral" },
  { code: "369", name: "Declaraciones de IVA OSS", period: "Trimestral" },
  { code: "130", name: "Impuesto sobre la Renta PF", period: "Trimestral" },
  { code: "115", name: "Retenciones capital inmobiliario", period: "Trimestral" },
  { code: "123", name: "Retenciones capital mobiliario", period: "Trimestral" },
  { code: "111", name: "Retenciones IRPF", period: "Trimestral" },
  { code: "190", name: "Retenciones anual IRPF", period: "Anual" },
  { code: "200", name: "Impuesto sociedades", period: "Anual" },
  { code: "202", name: "Pago a cuenta Sociedades", period: "3 pagos" },
  { code: "390", name: "IVA Anual", period: "Anual" },
  { code: "347", name: "Declaración anual operaciones 3ª", period: "Anual" },
  { code: "180", name: "Retenciones capital inmobiliario anual", period: "Anual" },
  { code: "193", name: "Retenciones capital mobiliario anual", period: "Anual" },
];

export default function ImpuestosPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const total = IMPUESTOS.length;
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, total);
  const totalPages = Math.ceil(total / perPage);

  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Impuestos</h1>
        <div className="flex space-x-2">
          {/* Botón para abrir modal de selección */}
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Selecciona tus modelos
          </button>

          {/* Botón convertido a Link para el calendario fiscal */}
          <Link
            href="/impuestos/calendario"
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            Calendario fiscal
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-4">Resumen de impuestos</h2>
        <p>No hay datos disponibles</p>
      </section>

      {/* Modal de configuración */}
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Fondo semitransparente */}
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold mb-4"
                  >
                    Configuración de Impuestos
                  </Dialog.Title>

                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Formulario</th>
                        <th className="py-2 text-left">Descripción</th>
                        <th className="py-2 text-left">Período</th>
                        <th className="py-2 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {IMPUESTOS.slice(start, end).map((f) => (
                        <tr
                          key={f.code}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-2">
                            <span className="inline-block w-10 text-center bg-gray-100 rounded">
                              {f.code}
                            </span>
                          </td>
                          <td className="py-2">{f.name}</td>
                          <td className="py-2">
                            <select
                              defaultValue={f.period}
                              className="border rounded-md p-1"
                            >
                              <option>Trimestral</option>
                              <option>Anual</option>
                              <option>3 pagos</option>
                            </select>
                          </td>
                          <td className="py-2">
                            <Switch
                              checked={false}
                              onChange={() => {}}
                              className={`${
                                false ? "bg-blue-600" : "bg-gray-300"
                              } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                            >
                              <span
                                className={`${
                                  false
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </Switch>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Paginación */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      Mostrando {start + 1}–{end} de {total} entradas
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={page === 1}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <FiChevronLeft />
                      </button>
                      <span>
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(p + 1, totalPages)
                          )
                        }
                        disabled={page === totalPages}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <FiChevronRight />
                      </button>
                      <select
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                        className="border rounded-md p-1"
                      >
                        {[5, 10, 20, 50].map((n) => (
                          <option key={n} value={n}>
                            {n} por página
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Botón Guardar */}
                  <div className="mt-6 text-right">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
