// File: /app/gastos/amortizaciones/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";

interface Amort {
  id: string;
  fecha: string;
  activo: string;
  base: number;
  amortAcumulada: number;
  amortAnual: number;
}

export default function LibroAmortizacionesPage() {
  const [hasta, setHasta] = useState("");
  const [datos, setDatos] = useState<Amort[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasta) {
      setLoading(true);
      // TODO: ajustar tu endpoint real
      fetch(`/api/gastos/amortizaciones?hasta=${hasta}`)
        .then((r) => r.json())
        .then((res: Amort[]) => setDatos(res))
        .finally(() => setLoading(false));
    }
  }, [hasta]);

  const sumBase = datos.reduce((s, a) => s + a.base, 0);
  const sumAcum = datos.reduce((s, a) => s + a.amortAcumulada, 0);
  const sumAnual = datos.reduce((s, a) => s + a.amortAnual, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📗 Libro de Amortizaciones</h1>

      <div className="flex items-end space-x-4">
        <div>
          <label className="block text-sm">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <CSVLink
          data={datos}
          filename={`amortizaciones_${hasta}.csv`}
          className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Exportar CSV
        </CSVLink>

        <button
          onClick={() =>
            window.open(
              `/gastos/amortizaciones/export.pdf?hasta=${hasta}`,
              "_blank"
            )
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Exportar PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Activo</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-right">Base</th>
              <th className="px-4 py-2 text-right">Acumulada</th>
              <th className="px-4 py-2 text-right">Anual</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Cargando…
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              datos.map((a) => (
                <tr
                  key={a.id}
                  className="border-t even:bg-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{a.activo}</td>
                  <td className="px-4 py-2">{a.fecha}</td>
                  <td className="px-4 py-2 text-right">{a.base.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    {a.amortAcumulada.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {a.amortAnual.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {datos.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={2} className="px-4 py-2 text-right">
                  Totales:
                </td>
                <td className="px-4 py-2 text-right">{sumBase.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{sumAcum.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{sumAnual.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
);
}
