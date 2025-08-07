// app/negocio/analisis-de-la-competencia/page.tsx
"use client";

import { useState, Fragment } from "react";
import { Tab } from "@headlessui/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type Competitor = {
  id: number;
  nombre: string;
  precio: string;
  ubicacion: string;
  fortalezas: string;
  debilidades: string;
};

export default function AnalisisCompetenciaPage() {
  const tabs = ["DAFO", "PEST", "PESTEL", "Competidores"] as const;
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("DAFO");

  // DAFO state
  const [dafo, setDafo] = useState({
    fortalezas: "",
    debilidades: "",
    oportunidades: "",
    amenazas: "",
  });

  // PEST state
  const [pest, setPest] = useState({
    politico: "",
    economico: "",
    social: "",
    tecnologico: "",
  });

  // PESTEL state
  const [pestel, setPestel] = useState({
    politico: "",
    economico: "",
    social: "",
    tecnologico: "",
    ambiental: "",
    legal: "",
  });

  // Competitors state
  const [competidores, setCompetidores] = useState<Competitor[]>([]);

  const addCompetitor = () => {
    setCompetidores((prev) => [
      ...prev,
      {
        id: Date.now(),
        nombre: "",
        precio: "",
        ubicacion: "",
        fortalezas: "",
        debilidades: "",
      },
    ]);
  };

  const updateCompetitor = (
    id: number,
    field: keyof Competitor,
    value: string
  ) => {
    setCompetidores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCompetitor = (id: number) => {
    setCompetidores((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Análisis de la Competencia</h1>

      <Tab.Group selectedIndex={tabs.indexOf(activeTab)} onChange={(i) => setActiveTab(tabs[i])}>
        <Tab.List className="flex space-x-2 border-b">
          {tabs.map((tab) => (
            <Tab key={tab} as={Fragment}>
              {({ selected }) => (
                <button
                  className={classNames(
                    "py-2 px-4 -mb-px font-medium",
                    selected
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
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
              <div>
                <h2 className="font-semibold mb-1">Fortalezas</h2>
                <textarea
                  value={dafo.fortalezas}
                  onChange={(e) =>
                    setDafo({ ...dafo, fortalezas: e.target.value })
                  }
                  className="w-full border rounded p-2 h-32"
                />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Debilidades</h2>
                <textarea
                  value={dafo.debilidades}
                  onChange={(e) =>
                    setDafo({ ...dafo, debilidades: e.target.value })
                  }
                  className="w-full border rounded p-2 h-32"
                />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Oportunidades</h2>
                <textarea
                  value={dafo.oportunidades}
                  onChange={(e) =>
                    setDafo({ ...dafo, oportunidades: e.target.value })
                  }
                  className="w-full border rounded p-2 h-32"
                />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Amenazas</h2>
                <textarea
                  value={dafo.amenazas}
                  onChange={(e) =>
                    setDafo({ ...dafo, amenazas: e.target.value })
                  }
                  className="w-full border rounded p-2 h-32"
                />
              </div>
            </div>
          </Tab.Panel>

          {/* PEST */}
          <Tab.Panel>
            <div className="space-y-4">
              {(["politico", "economico", "social", "tecnologico"] as const).map((field) => (
                <div key={field}>
                  <h2 className="font-semibold capitalize mb-1">{field}</h2>
                  <textarea
                    value={pest[field]}
                    onChange={(e) =>
                      setPest({ ...pest, [field]: e.target.value })
                    }
                    className="w-full border rounded p-2 h-24"
                  />
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* PESTEL */}
          <Tab.Panel>
            <div className="space-y-4">
              {(
                ["politico", "economico", "social", "tecnologico", "ambiental", "legal"] as const
              ).map((field) => (
                <div key={field}>
                  <h2 className="font-semibold capitalize mb-1">{field}</h2>
                  <textarea
                    value={pestel[field]}
                    onChange={(e) =>
                      setPestel({ ...pestel, [field]: e.target.value })
                    }
                    className="w-full border rounded p-2 h-24"
                  />
                </div>
              ))}
            </div>
          </Tab.Panel>

          {/* Competidores */}
          <Tab.Panel>
            <div className="mb-4">
              <button
                onClick={addCompetitor}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                + Añadir Competidor
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
                    <th className="border px-2 py-1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {competidores.map((c) => (
                    <tr key={c.id}>
                      <td className="border px-2 py-1">
                        <input
                          value={c.nombre}
                          onChange={(e) =>
                            updateCompetitor(c.id, "nombre", e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          value={c.precio}
                          onChange={(e) =>
                            updateCompetitor(c.id, "precio", e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          value={c.ubicacion}
                          onChange={(e) =>
                            updateCompetitor(c.id, "ubicacion", e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          value={c.fortalezas}
                          onChange={(e) =>
                            updateCompetitor(c.id, "fortalezas", e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          value={c.debilidades}
                          onChange={(e) =>
                            updateCompetitor(c.id, "debilidades", e.target.value)
                          }
                          className="w-full border rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          onClick={() => removeCompetitor(c.id)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {competidores.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500"
                      >
                        No hay competidores añadidos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
