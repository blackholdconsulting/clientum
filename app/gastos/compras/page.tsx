// File: /app/gastos/compras/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { fetchCompras } from "@/lib/api";
import { CSVLink } from "react-csv";

interface Compra {
  id: string;
  fecha: string;
  proveedor: string;
  numeroFactura: string;
  base: number;
  iva: number;
  total: number;
}

export default function LibroComprasPage() {
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [datos, setDatos] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (desde && hasta) {
      setLoading(true);
      fetchCompras({ desde, hasta }).then((res) => {
        setDatos(res);
        setLoading(false);
      });
    }
  }, [desde, hasta]);

  const sumBase = datos.reduce((s, c) => s + c.base, 0);
  const sumIva = datos.reduce((s, c) => s + c.iva, 0);
  const sumTotal = datos.reduce((s, c) => s + c.total, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📕 Libro de Compras y Gastos</h1>

      {/* Filtros y export */}
      <div className="flex items-end space-x-4">
        <div>
          <label className="block text-sm">Desde</label>
          <DatePicker value={desde} onChange={setDesde} />
        </div>
        <div>
          <label className="block text-sm">Hasta</label>
          <DatePicker value={hasta} onChange={setHasta} />
        </div>
        <CSVLink
          data={datos}
          filename={`compras_${desde}_${hasta}.csv`}
          className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Exportar CSV
        </CSVLink>
        <button
          onClick={() =>
            window.open(
              `/gastos/compras/export.pdf?desde=${desde}&hasta=${hasta}`,
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
              <th className="px-4 py-2 text-left">Proveedor</th>
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
                  Cargando...
                </td>
              </tr>
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              datos.map((c) => (
                <tr
                  key={c.id}
                  className="border-t even:bg-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{c.fecha}</td>
                  <td className="px-4 py-2">{c.proveedor}</td>
                  <td className="px-4 py-2">{c.numeroFactura}</td>
                  <td className="px-4 py-2 text-right">{c.base.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{c.iva.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{c.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {datos.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right">
                  Totales:
                </td>
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
