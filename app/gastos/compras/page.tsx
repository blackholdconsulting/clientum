// File: /app/gastos/compras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Compra {
  id: string;
  fecha: string;
  proveedor: string;
  numero_factura: string;
  base: number;
  iva: number;
  total: number;
}

export default function LibroComprasPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [datos, setDatos] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!desde || !hasta) return;
    setLoading(true);

    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from<Compra>("compras")
          .select(`
            id,
            proveedores(nombre) as proveedor,
            fecha,
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
      <h1 className="text-2xl font-bold">📕 Libro de Compras y Gastos</h1>

      {/* filtros similares… */}
      <div className="flex items-end space-x-4">
        {/* inputs fecha */}
        <CSVLink data={datos} filename={`compras_${desde}_${hasta}.csv`} className="ml-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
          Exportar CSV
        </CSVLink>
        <button onClick={() => window.open(`/gastos/compras/export.pdf?desde=${desde}&hasta=${hasta}`, "_blank")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Exportar PDF
        </button>
      </div>

      {/* tabla idéntica al de ventas, ajustando columnas */}
      …
    </div>
  );
}
