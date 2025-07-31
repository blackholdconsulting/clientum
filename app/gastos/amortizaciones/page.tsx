// File: /app/gastos/amortizaciones/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Amort {
  id: string;
  activo: string;
  fecha: string;
  cuota: number;
  acumulada: number;
}

export default function LibroAmortizacionesPage() {
  const [hasta, setHasta] = useState<string>("");
  const [datos, setDatos] = useState<Amort[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!hasta) return;
    setLoading(true);

    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from<Amort>("amortizaciones")
          .select(`
            id,
            activos(nombre) as activo,
            fecha,
            cuota,
            acumulada
          `)
          .eq("user_id", uid)
          .lte("fecha", hasta)
          .order("fecha", { ascending: true })
      )
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setDatos(data ?? []);
      })
      .finally(() => setLoading(false));
  }, [hasta]);

  const sumCuota     = datos.reduce((s, v) => s + v.cuota, 0);
  const sumAcumulada = datos.reduce((s, v) => s + v.acumulada, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📗 Libro de Amortizaciones</h1>

      {/* Filtro y export */}
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

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Activo</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-right">Cuota</th>
              <th className="px-4 py-2 text-right">Acumulada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Cargando…
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
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
                  <td className="px-4 py-2 text-right">
                    {a.cuota.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {a.acumulada.toFixed(2)}
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
                <td className="px-4 py-2 text-right">{sumCuota.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">
                  {sumAcumulada.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
