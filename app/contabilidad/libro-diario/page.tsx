"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Asiento {
  id: string;
  fecha: string;
  concepto: string;
  totalDebe: number;
  totalHaber: number;
}

export default function LibroDiarioPage() {
  const router = useRouter();
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [search, setSearch] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    fetch(
      `/api/contabilidad/asientos?desde=${desde}&hasta=${hasta}&q=${encodeURIComponent(
        search
      )}`
    )
      .then((res) => res.json())
      .then((data) => setAsientos(data.asientos || []));
  }, [desde, hasta, search]);

  return (
    <div className="p-6">
      {/* Header con botón Nuevo asiento */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 7h18M3 12h18M3 17h18" strokeWidth={2} />
          </svg>
          Libro diario
        </h1>
        <button
          onClick={() => router.push("/contabilidad/libro-diario/nuevo-asiento")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nuevo asiento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar concepto..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="date"
          value={desde}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDesde(e.target.value)
          }
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={hasta}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setHasta(e.target.value)
          }
          className="border rounded px-3 py-2"
        />
        <button
          onClick={() => {
            setSearch("");
            setDesde("");
            setHasta("");
          }}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla de asientos */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Concepto</th>
              <th className="px-4 py-2 text-right">Debe</th>
              <th className="px-4 py-2 text-right">Haber</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asientos.length > 0 ? (
              asientos.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.fecha}</td>
                  <td className="px-4 py-2">{a.concepto}</td>
                  <td className="px-4 py-2 text-right">
                    {a.totalDebe.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {a.totalHaber.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/contabilidad/libro-diario/${a.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No hay asientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
