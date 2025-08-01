"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LineaAsiento {
  id: number;
  cuenta: string;
  debe: number;
  haber: number;
}

export default function NuevoAsientoPage() {
  const router = useRouter();
  const [fecha, setFecha] = useState("");
  const [concepto, setConcepto] = useState("");
  const [lineas, setLineas] = useState<LineaAsiento[]>([
    { id: 1, cuenta: "", debe: 0, haber: 0 },
  ]);

  const addLinea = () =>
    setLineas((prev) => [
      ...prev,
      { id: Date.now(), cuenta: "", debe: 0, haber: 0 },
    ]);

  const removeLinea = (id: number) =>
    setLineas((prev) => prev.filter((l) => l.id !== id));

  const handleLineaChange = (
    id: number,
    field: keyof Omit<LineaAsiento, "id">,
    value: string
  ) =>
    setLineas((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              [field]:
                field === "cuenta"
                  ? value
                  : Math.max(0, Number(value)),
            }
          : l
      )
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = { fecha, concepto, lineas };
    console.log("Crear asiento:", payload);
    // TODO: enviar a tu API
    router.push("/contabilidad/cuadro-de-cuentas");
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/contabilidad/cuadro-de-cuentas"
          className="text-blue-600 hover:underline"
        >
          ← Volver al Cuadro de Cuentas
        </Link>
        <h1 className="text-2xl font-semibold ml-4">Nuevo Asiento</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded shadow"
      >
        {/* Fecha y Concepto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Concepto
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Descripción del asiento"
              required
            />
          </div>
        </div>

        {/* Líneas del asiento */}
        <h2 className="text-lg font-medium">Líneas del Asiento</h2>
        <div className="space-y-4">
          {lineas.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
            >
              <input
                type="text"
                value={l.cuenta}
                onChange={(e) =>
                  handleLineaChange(l.id, "cuenta", e.target.value)
                }
                placeholder="Código de cuenta"
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="number"
                value={l.debe}
                onChange={(e) =>
                  handleLineaChange(l.id, "debe", e.target.value)
                }
                placeholder="Debe"
                className="border rounded px-3 py-2"
                min={0}
              />
              <input
                type="number"
                value={l.haber}
                onChange={(e) =>
                  handleLineaChange(l.id, "haber", e.target.value)
                }
                placeholder="Haber"
                className="border rounded px-3 py-2"
                min={0}
              />
              <button
                type="button"
                onClick={() => removeLinea(l.id)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLinea}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Añadir línea
          </button>
        </div>

        {/* Enviar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar Asiento
          </button>
        </div>
      </form>
    </div>
  );
}
