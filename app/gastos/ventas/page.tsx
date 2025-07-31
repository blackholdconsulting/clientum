// File: /app/gastos/ventas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Venta {
  id: string;
  fecha: string;
  cliente: string;
  numero_factura: string;
  base: number;
  iva: number;
  total: number;
}

export default function LibroVentasPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [datos, setDatos] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!desde || !hasta) return;
    setLoading(true);

    // Obtengo user_id de la sesión
    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from<Venta>("ventas")
          .select(`
            id,
            fecha,
            clientes(nombre) as cliente,
            numero_factura,
            base,
            iva,
            total
          `)
          .eq("user_id", uid)
          .gte("fecha", desde)
          .lte("fecha", hasta)
          .order("fecha", { ascending: true })
      )
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setDatos(data ?? []);
      })
      .finally(() => setLoading(false));
  }, [desde, hasta]);

  const sumBase  = datos.reduce((s, v) => s + v.base, 0);
  const sumIva   = datos.reduce((s, v) => s + v.iva, 0);
  const sumTotal = datos.reduce((s, v) => s + v.total, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📒 Libro de Ventas e Ingresos</h1>

      {/* Filtros */}
      <div className="flex items-end space-x-4">
        <div>
          <label className="block text-sm">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
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
          filename={`ventas_${desde}_${hasta}.csv`}
          className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Exportar CSV
        </CSVLink>

        <button
          onClick={() =>
            window.open(
              `/gastos/ventas/export.pdf?desde=${desde}&hasta=${hasta}`,
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
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Factura</th>
              <th className="px-4 py-2 text-right">Base</th>
              <th className="px-4 py-2 text-right">IVA</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Cargando…
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              datos.map((v) => (
                <tr key={v.id} className="border-t even:bg-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2">{v.fecha}</td>
                  <td className="px-4 py-2">{v.cliente}</td>
                  <td className="px-4 py-2">{v.numero_factura}</td>
                  <td className="px-4 py-2 text-right">{v.base.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{v.iva.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{v.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {datos.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right">Totales:</td>
                <td className="px-4 py-2 text-right">{sumBase.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{sumIva.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{sumTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
