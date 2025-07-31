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

  // Formulario (añadir o editar)
  const [editId, setEditId] = useState<string | null>(null);
  const [fecha, setFecha] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [numero, setNumero] = useState("");
  const [base, setBase] = useState<number | "">("");
  const [ivaPct, setIvaPct] = useState<number>(21);

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Carga clientes para el <select>
  useEffect(() => {
    supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre")
      .then(({ data, error }) => {
        if (error) console.error("clientes load error:", error);
        else setClientes(data || []);
      });
  }, []);

  // Función para traer ventas según filtros
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
        if (error) console.error("fetchVentas error:", error);
        else setDatos((data ?? []) as unknown as Venta[]);
      })
      .finally(() => setLoading(false));
  };

  // Refresca al cambiar filtros
  useEffect(fetchVentas, [desde, hasta]);

  // Preparar formulario para editar una fila
  const startEdit = (v: Venta) => {
    setEditId(v.id);
    setFecha(v.fecha);
    setClienteId(clientes.find(c => c.nombre === v.cliente[0]?.nombre)?.id || "");
    setNumero(v.numero_factura);
    setBase(v.base);
    setIvaPct(Math.round((v.iva / v.base) * 100));
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditId(null);
    setFecha("");
    setClienteId("");
    setNumero("");
    setBase("");
    setIvaPct(21);
  };

  // Maneja submit tanto para añadir como para actualizar
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !clienteId || !numero || base === "") {
      alert("Rellena todos los campos");
      return;
    }
    setLoading(true);
    const baseNum = Number(base);
    const iva = +(baseNum * ivaPct / 100).toFixed(2);

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user.id) {
      console.error("No session", sessionError);
      setLoading(false);
      return;
    }

    if (editId) {
      // update
      const { error: updError } = await supabase
        .from("ventas")
        .update({ fecha, cliente_id: clienteId, numero_factura: numero, base: baseNum, iva })
        .eq("id", editId);
      if (updError) {
        console.error("update error", updError);
        alert("Error al actualizar: " + updError.message);
      } else {
        cancelEdit();
        fetchVentas();
      }
    } else {
      // insert
      const { data: insData, error: insError } = await supabase
        .from("ventas")
        .insert({ user_id: session.user.id, fecha, cliente_id: clienteId, numero_factura: numero, base: baseNum, iva })
        .select();
      if (insError) {
        console.error("insert error", insError);
        alert("Error al guardar: " + insError.message);
      } else {
        // añadir localmente para feedback inmediato
        setDatos(prev => [
          ...prev,
          {
            ...(insData![0] as any),
            cliente: clientes.filter(c => c.id === clienteId).map(c => ({ nombre: c.nombre }))
          }
        ]);
        cancelEdit();
      }
    }
    setLoading(false);
  };

  // Eliminar fila
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta factura?")) return;
    const { error } = await supabase.from("ventas").delete().eq("id", id);
    if (error) {
      console.error("delete error", error);
      alert("Error al eliminar: " + error.message);
    } else {
      setDatos(prev => prev.filter(v => v.id !== id));
    }
  };

  // Sumatorios
  const sumBase  = datos.reduce((s, v) => s + v.base, 0);
  const sumIva   = datos.reduce((s, v) => s + v.iva, 0);
  const sumTotal = datos.reduce((s, v) => s + v.total, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📒 Libro de Ventas e Ingresos</h1>

      {/* === Formulario de alta/edición === */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded shadow"
      >
        <div>
          <label className="block text-sm">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Cliente</label>
          <select
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          >
            <option value="">— Selecciona —</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Nº Factura</label>
          <input
            type="text"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Base</label>
          <input
            type="number"
            value={base}
            onChange={e => setBase(+e.target.value)}
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
            onChange={e => setIvaPct(+e.target.value)}
            className="border rounded px-2 py-1 w-full"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="col-span-full lg:col-span-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {editId ? (loading ? "Actualizando…" : "Guardar cambios") 
                  : (loading ? "Guardando…" : "Añadir Factura")}
        </button>
        {editId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="col-span-full lg:col-span-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* === Filtros de rango === */}
      <div className="flex items-end space-x-4">
        <div>
          <label className="block text-sm">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
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

      {/* === Export === */}
      <div className="flex space-x-4">
        <CSVLink
          data={datos.map(v => ({ ...v, cliente: v.cliente[0]?.nombre ?? "" }))}
          filename={`ventas_${desde}_${hasta}.csv`}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Exportar CSV
        </CSVLink>
        <button
          onClick={() => window.open(`/gastos/ventas/export.pdf?desde=${desde}&hasta=${hasta}`, "_blank")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Exportar PDF
        </button>
      </div>

      {/* === Tabla con Edit/Delete === */}
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
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">No hay datos</td>
              </tr>
            ) : (
              datos.map(v => (
                <tr key={v.id} className="border-t even:bg-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2">{v.fecha}</td>
                  <td className="px-4 py-2">{v.cliente[0]?.nombre}</td>
                  <td className="px-4 py-2">
                    <Link href={`/facturas/${v.numero_factura}`} className="text-indigo-600 hover:underline">
                      {v.numero_factura}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right">{v.base.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{v.iva.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{v.total.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => startEdit(v)}
                      className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
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
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
