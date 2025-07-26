mkdir -p app/impuestos
cat > app/impuestos/page.tsx << 'EOF'
"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiCalendar, FiPlus, FiSettings, FiX } from "react-icons/fi";
import { GiReceiptTax } from "react-icons/gi";

interface Modelo {
  code: string;
  name: string;
  period: "Trimestral" | "Anual";
}

const MODELOS: Modelo[] = [
  { code: "303", name: "Declaración de IVA", period: "Trimestral" },
  { code: "349", name: "Intracomunitarias", period: "Trimestral" },
  { code: "200", name: "Impuesto sobre Sociedades", period: "Anual" },
  { code: "110", name: "Retenciones IRPF", period: "Trimestral" },
  { code: "130", name: "IRPF Personas Físicas", period: "Trimestral" },
  { code: "111", name: "Anual Retenciones", period: "Anual" },
];

export default function ImpuestosPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"Todos" | "Ventas" | "Compras">("Todos");
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = MODELOS.filter((m) => {
    if (filter === "Todos") return true;
    return m.code.startsWith(filter === "Ventas" ? "3" : "2");
  });

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);

  return (
    <main className="p-6 bg-white rounded-md shadow-md">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <GiReceiptTax className="mr-2 text-indigo-600" /> Impuestos
        </h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50">
            <FiCalendar className="mr-2" /> Calendario fiscal
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <FiPlus className="mr-2" /> Selecciona tus modelos
          </button>
        </div>
      </header>

      <div className="mb-6 border rounded-md p-4 flex justify-between items-center hover:shadow-sm transition">
        <div className="flex items-center space-x-3">
          <FiSettings className="text-xl text-gray-500" />
          <span className="font-medium">Modelos de impuestos</span>
        </div>
        <button className="text-blue-600 hover:underline">Leer artículo</button>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Resumen de impuestos</h2>
        <div className="border rounded-md overflow-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Categoría</th>
                <th className="px-4 py-2">Subtotal</th>
                <th className="px-4 py-2">Importe</th>
              </tr>
            </thead>
            <tbody>
              {["Ventas", "Compras"].map((cat) => (
                <tr key={cat} className="border-b">
                  <td className="px-4 py-3">{cat}</td>
                  <td className="px-4 py-3">No hay datos disponibles</td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={setOpen}>
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-30"
              leave="ease-in duration-200"
              leaveFrom="opacity-30"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transform bg-white shadow-xl rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-medium text-gray-900">
                    Configuración de impuestos
                  </Dialog.Title>
                  <button onClick={() => setOpen(false)}>
                    <FiX size={20} className="text-gray-600 hover:text-gray-800" />
                  </button>
                </div>

                <div className="flex items-center mb-4 space-x-3">
                  <label className="font-medium">Mostrar:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="border rounded-md p-2"
                  >
                    <option>Todos</option>
                    <option>Ventas</option>
                    <option>Compras</option>
                  </select>
                </div>

                <div className="max-h-80 overflow-auto mb-4">
                  <table className="min-w-full text-left">
                    <thead className="border-b">
                      <tr>
                        <th className="px-4 py-2">Formulario</th>
                        <th className="px-4 py-2">Descripción</th>
                        <th className="px-4 py-2">Período</th>
                        <th className="px-4 py-2">Estado</th>
                        <th className="px-4 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((m) => (
                        <tr key={m.code} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono">{m.code}</td>
                          <td className="px-4 py-2">{m.name}</td>
                          <td className="px-4 py-2">
                            <select defaultValue={m.period} className="border rounded p-1">
                              <option>Trimestral</option>
                              <option>Anual</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={!!toggled[m.code]}
                              onChange={() =>
                                setToggled((prev) => ({ ...prev, [m.code]: !prev[m.code] }))
                              }
                              className="h-5 w-5 text-blue-600 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <FiSettings className="inline-block cursor-pointer text-gray-600 hover:text-gray-800" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {start + 1}–{Math.min(end, total)} de {total} entradas
                  </p>
                  <div className="flex items-center space-x-2">
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(+e.target.value);
                        setPage(1);
                      }}
                      className="border rounded p-1"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} por página
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      &lt; Anterior
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, Math.ceil(total / perPage)))
                      }
                      disabled={end >= total}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Siguiente &gt;
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </main>
);
EOF
