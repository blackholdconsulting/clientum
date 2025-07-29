// app/negocio/estudio-de-mercado/page.tsx
"use client";

import { useState, Fragment } from "react";
import { Tab } from "@headlessui/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EstudioMercadoPage() {
  const sections = [
    "Visión General",
    "Segmentación",
    "Tamaño de Mercado",
    "Tendencias",
    "Conclusiones",
  ] as const;
  const [active, setActive] = useState<typeof sections[number]>(
    "Visión General"
  );

  const [vision, setVision] = useState({
    objetivo: "",
    alcance: "",
    metodología: "",
  });
  const [segmentacion, setSegmentacion] = useState({
    demográfica: "",
    geográfica: "",
    psicográfica: "",
    conductual: "",
  });
  const [tamano, setTamano] = useState({
    mercadoTotal: "",
    mercadoServible: "",
    mercadoObtenible: "",
  });
  const [tendencias, setTendencias] = useState({
    tecnológicas: "",
    económicas: "",
    sociales: "",
    regulatorias: "",
  });
  const [conclusiones, setConclusiones] = useState("");

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold text-indigo-700">
        Estudio de Mercado
      </h1>

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
                    "py-2 px-4 -mb-px font-medium",
                    selected
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-600 hover:text-gray-800"
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
                  placeholder="Definir claramente qué buscamos conocer..."
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
                  placeholder="Mercados, segmentos y regiones a analizar..."
                />
              </label>
              <label className="block">
                <span className="font-semibold">Metodología</span>
                <textarea
                  rows={2}
                  value={vision.metodología}
                  onChange={(e) =>
                    setVision({ ...vision, metodología: e.target.value })
                  }
                  className="mt-1 w-full border rounded p-2"
                  placeholder="Cuantitativa, cualitativa, fuentes primarias/secundarias..."
                />
              </label>
            </div>
          </Tab.Panel>

          {/* Segmentación */}
          <Tab.Panel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  "demográfica",
                  "geográfica",
                  "psicográfica",
                  "conductual",
                ] as const
              ).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={3}
                    value={segmentacion[key]}
                    onChange={(e) =>
                      setSegmentacion({
                        ...segmentacion,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 w-full border rounded p-2"
                    placeholder={`Describir segmentación ${key}...`}
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
                  placeholder="p.ej. €X millones"
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
                  placeholder="Porción del TAM accesible"
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
                  placeholder="Nuestra cuota proyectada"
                />
              </label>
            </div>
          </Tab.Panel>

          {/* Tendencias */}
          <Tab.Panel>
            <div className="space-y-4">
              {(
                [
                  "tecnológicas",
                  "económicas",
                  "sociales",
                  "regulatorias",
                ] as const
              ).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold capitalize">{key}</span>
                  <textarea
                    rows={3}
                    value={tendencias[key]}
                    onChange={(e) =>
                      setTendencias({ ...tendencias, [key]: e.target.value })
                    }
                    className="mt-1 w-full border rounded p-2"
                    placeholder={`Analizar tendencias ${key}...`}
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
                placeholder="Resumir insights y recomendaciones..."
              />
            </label>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
