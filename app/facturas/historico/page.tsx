// app/facturas/historico/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";

type Factura = {
  id: string;
  cliente: string;
  fecha: string;
  importe: number;
  estado: string;
};

export default function HistoricoFacturasPage() {
  const supabase = createClientComponentClient();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [minImporte, setMinImporte] = useState<number | "">("");
  const [maxImporte, setMaxImporte] = useState<number | "">("");

  // Carga lista de clientes únicos
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("facturas")
        .select("cliente", { count: "exact" });
      if (!error && data) {
        const únicos = Array.from(new Set(data.map((f) => f.cliente)));
        setClientes(únicos);
      }
    })();
  }, []);

  // Carga facturas con filtros
  const loadFacturas = async () => {
    let query = supabase.from("facturas").select("*");
    if (filtroCliente) query = query.eq("cliente", filtroCliente);
    if (desde) query = query.gte("fecha", desde);
    if (hasta) query = query.lte("fecha", hasta);
    if (minImporte !== "") query = query.gte("importe", minImporte);
    if (maxImporte !== "") query = query.lte("importe", maxImporte);

    const { data, error } = await query.order("fecha", { ascending: false });
    if (!error && data) setFacturas(data);
  };

  // Efecto inicial y cuando cambian filtros
  useEffect(() => {
    loadFacturas();
  }, [filtroCliente, desde, hasta, minImporte, maxImporte]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Histórico Facturas</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Imp. Min</label>
            <input
              type="number"
              min={0}
              value={minImporte}
              onChange={(e) => setMinImporte(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Imp. Max</label>
            <input
              type="number"
              min={0}
              value={maxImporte}
              onChange={(e) => setMaxImporte(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Importe</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-4 py-2">
                  {format(new Date(f.fecha), "dd/MM/yyyy")}
                </td>
                <td className="px-4 py-2">{f.cliente}</td>
                <td className="px-4 py-2">€ {f.importe.toFixed(2)}</td>
                <td className="px-4 py-2 capitalize">{f.estado}</td>
              </tr>
            ))}
            {facturas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No hay facturas que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
