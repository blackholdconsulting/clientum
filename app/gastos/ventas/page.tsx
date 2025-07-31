// File: /app/gastos/ventas/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Cliente {
  id: string;
  nombre: string;
}

interface Venta {
  id: string;
  fecha: string;
  numero_factura: string;
  base: number;
  iva: number;
  total: number;
  cliente: { nombre: string }[];
}

export default function LibroVentasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [datos, setDatos] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fecha, setFecha] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [numero, setNumero] = useState("");
  const [base, setBase] = useState<number | "">("");
  const [ivaPct, setIvaPct] = useState<number>(21);

  // Fechas filtro
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Carga lista de clientes para el select
  useEffect(() => {
    supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre")
      .then(({ data, error }) => {
        if (data) setClientes(data);
      });
  }, []);

  // Refresca el listado según rango
  const fetchVentas = () => {
    if (!desde || !hasta) return;
    setLoading(true);
    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from("ventas")
          .select(`
            id,
            fecha,
            numero_factura,
            base,
            iva,
            total,
            cliente:clientes(nombre)
          `)
          .eq("user_id", uid)
          .gte("fecha", desde)
          .lte("fecha", hasta)
          .order("fecha", { ascending: true })
      )
      .then(({ data, error }) => {
        if (!error) setDatos((data ?? []) as unknown as Venta[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchVentas, [desde, hasta]);

  // Manejador de alta de factura
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !clienteId || !numero || !base) {
      alert("Rellena todos los campos del formulario");
      return;
    }
    setLoading(true);
    const iva = +( (base * ivaPct) / 100 ).toFixed(2);
    await supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from("ventas")
          .insert({
            user_id: uid,
            fecha,
            cliente_id: clienteId,
            numero_factura: numero,
            base,
            iva,
          })
      );
    // limpia y refresca
    setFecha("");
    setClienteId("");
    setNumero("");
    setBase("");
    setIvaPct(21);
    await fetchVentas();
    setLoading(false);
  };

  const sumBase  = datos.reduce((s, v) => s + v.base, 0);
  const sumIva   = datos.reduce((s, v) => s + v.iva, 0);
  const sumTotal = datos.reduce((s, v) => s + v.total, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📒 Libro de Ventas e Ingresos</h1>

      {/* --- Formulario de nueva factura --- */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded shadow"
      >
        <div>
          <label className="block text-sm">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          >
            <option value="">— Selecciona —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Factura Nº</label>
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Base</label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(+e.target.value)}
            className="border rounded px-2 py-1 w-full"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm">% IVA</label>
          <input
            type="number"
            value={ivaPct}
            onChange={(e) => setIvaPct(+e.target.value)}
            className="border rounded px-2 py-1 w-full"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="col-span-full lg:col-span-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {loading ? "Guardando…" : "Añadir Factura"}
        </button>
      </form>

      {/* --- Filtros de rango --- */}
      <div className="flex items-end space-x-4">
        {[["Desde", desde, setDesde], ["Hasta", hasta, setHasta]].map(
          ([label, val, setter]) => (
            <div key={label}>
              <label className="block text-sm">{label}</label>
              <input
                type="date"
                value={val as string}
                onChange={(e) => (setter as any)(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
          )
        )}
        <button
          onClick={fetchVentas}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Aplicar filtros
        </button>
      </div>

      {/* --- Tabla de resultados --- */}
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
            {datos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              datos.map((v) => (
                <tr
                  key={v.id}
                  className="border-t even:bg-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{v.fecha}</td>
                  <td className="px-4 py-2">{v.cliente[0]?.nombre}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/facturas/${v.numero_factura}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {v.numero_factura}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {v.base.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {v.iva.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {v.total.toFixed(2)}
                  </td>
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
                <td className="px-4 py-2 text-right">
                  {datos.reduce((s, v) => s + v.base, 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {datos.reduce((s, v) => s + v.iva, 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {datos.reduce((s, v) => s + v.total, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
