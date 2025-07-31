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

  // Formulario
  const [fecha, setFecha] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [numero, setNumero] = useState("");
  const [base, setBase] = useState<number | "">("");
  const [ivaPct, setIvaPct] = useState<number>(21);

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Carga clientes
  useEffect(() => {
    supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre")
      .then(({ data }) => {
        if (data) setClientes(data);
      });
  }, []);

  // Funcion para traer ventas
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
        if (!error) {
          setDatos((data ?? []) as unknown as Venta[]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchVentas, [desde, hasta]);

  // Alta de factura
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !clienteId || !numero || base === "") {
      alert("Rellena todos los campos");
      return;
    }
    setLoading(true);
    const iva = +( (base as number) * ivaPct / 100 ).toFixed(2);
    const uid = (await supabase.auth.getSession()).data.session?.user.id;
    await supabase
      .from("ventas")
      .insert({
        user_id: uid,
        fecha,
        cliente_id: clienteId,
        numero_factura: numero,
        base: base as number,
        iva,
      });
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

      {/* Formulario de alta */}
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
          <label className="block text-sm">Nº Factura</label>
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

      {/* Filtros de rango */}
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
        <button
          onClick={fetchVentas}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Aplicar filtros
        </button>
      </div>

      {/* Export */}
      <div className="flex space-x-4">
        <CSVLink
          data={datos.map(v => ({ ...v, cliente: v.cliente[0]?.nombre ?? "" }))}
          filename={`ventas_${desde}_${hasta}.csv`}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
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
                <td colSpan={3} className="px-4 py-2 text-right">
                  Totales:
                </td>
                <td className="px-4 py-2 text-right">
                  {sumBase.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {sumIva.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {sumTotal.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
