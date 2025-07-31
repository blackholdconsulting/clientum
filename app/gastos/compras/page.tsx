// File: /app/gastos/compras/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Proveedor {
  id: string;
  nombre: string;
}

interface Compra {
  id: string;
  fecha: string;
  numero_factura: string;
  base: number;
  iva: number;
  total: number;
  proveedor: { nombre: string }[];
}

export default function LibroComprasPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [datos, setDatos] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);

  // CRUD state
  const [editId, setEditId] = useState<string | null>(null);
  const [fecha, setFecha] = useState("");
  const [provId, setProvId] = useState("");
  const [numero, setNumero] = useState("");
  const [base, setBase] = useState<number | "">("");
  const [ivaPct, setIvaPct] = useState<number>(21);

  // filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // cargar proveedores para el <select>
  useEffect(() => {
    supabase
      .from("proveedores")
      .select("id, nombre")
      .order("nombre")
      .then(({ data, error }) => {
        if (error) console.error("Proveedor load error:", error);
        else setProveedores(data || []);
      });
  }, []);

  // función para traer compras filtradas
  const fetchCompras = () => {
    if (!desde || !hasta) return;
    setLoading(true);
    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from("compras")
          .select(`
            id,
            fecha,
            numero_factura,
            base,
            iva,
            total,
            proveedor:proveedores(nombre)
          `)
          .eq("user_id", uid)
          .gte("fecha", desde)
          .lte("fecha", hasta)
          .order("fecha", { ascending: true })
      )
      .then(({ data, error }) => {
        if (error) console.error("fetchCompras error:", error);
        else setDatos((data ?? []) as unknown as Compra[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchCompras, [desde, hasta]);

  // preparar edición
  const startEdit = (c: Compra) => {
    setEditId(c.id);
    setFecha(c.fecha);
    setNumero(c.numero_factura);
    setBase(c.base);
    setIvaPct(Math.round((c.iva / c.base) * 100));
    const prov = proveedores.find(p => p.nombre === c.proveedor[0]?.nombre);
    setProvId(prov?.id || "");
  };
  const cancelEdit = () => {
    setEditId(null);
    setFecha("");
    setProvId("");
    setNumero("");
    setBase("");
    setIvaPct(21);
  };

  // alta o update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !provId || !numero || base === "") {
      alert("Rellena todos los campos");
      return;
    }
    setLoading(true);
    const baseNum = Number(base);
    const iva = +(baseNum * ivaPct / 100).toFixed(2);

    const {
      data: { session },
      error: sessErr
    } = await supabase.auth.getSession();
    if (sessErr || !session?.user.id) {
      console.error("No session", sessErr);
      setLoading(false);
      return;
    }

    if (editId) {
      // update
      const { error: updErr } = await supabase
        .from("compras")
        .update({
          fecha,
          proveedor_id: provId,
          numero_factura: numero,
          base: baseNum,
          iva
        })
        .eq("id", editId);
      if (updErr) {
        console.error("update error", updErr);
        alert("Error al actualizar: " + updErr.message);
      } else {
        cancelEdit();
        fetchCompras();
      }
    } else {
      // insert
      const { data: insData, error: insErr } = await supabase
        .from("compras")
        .insert({
          user_id: session.user.id,
          fecha,
          proveedor_id: provId,
          numero_factura: numero,
          base: baseNum,
          iva
        })
        .select();
      if (insErr) {
        console.error("insert error", insErr);
        alert("Error al guardar: " + insErr.message);
      } else {
        // feedback inmediato
        setDatos(prev => [
          ...prev,
          {
            ...(insData![0] as any),
            proveedor: proveedores
              .filter(p => p.id === provId)
              .map(p => ({ nombre: p.nombre }))
          }
        ]);
        cancelEdit();
      }
    }
    setLoading(false);
  };

  // eliminar
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta compra/gasto?")) return;
    const { error } = await supabase.from("compras").delete().eq("id", id);
    if (error) {
      console.error("delete error", error);
      alert("Error al eliminar: " + error.message);
    } else {
      setDatos(prev => prev.filter(c => c.id !== id));
    }
  };

  // sumatorios
  const sumBase  = datos.reduce((s, c) => s + c.base, 0);
  const sumIva   = datos.reduce((s, c) => s + c.iva, 0);
  const sumTotal = datos.reduce((s, c) => s + c.total, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📕 Libro de Compras y Gastos</h1>

      {/* formulario alta/edición */}
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
          <label className="block text-sm">Proveedor</label>
          <select
            value={provId}
            onChange={e => setProvId(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          >
            <option value="">— Selecciona —</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
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
          {editId
            ? loading
              ? "Actualizando…"
              : "Guardar cambios"
            : loading
            ? "Guardando…"
            : "Añadir Compra"}
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

      {/* filtros */}
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
          onClick={fetchCompras}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Aplicar filtros
        </button>
      </div>

      {/* export */}
      <div className="flex space-x-4">
        <CSVLink
          data={datos.map(c => ({
            ...c,
            proveedor: c.proveedor[0]?.nombre ?? ""
          }))}
          filename={`compras_${desde}_${hasta}.csv`}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
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

      {/* tabla con CRUD */}
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
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              datos.map(c => (
                <tr key={c.id} className="border-t even:bg-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2">{c.fecha}</td>
                  <td className="px-4 py-2">{c.proveedor[0]?.nombre}</td>
                  <td className="px-4 py-2">{c.numero_factura}</td>
                  <td className="px-4 py-2 text-right">{c.base.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{c.iva.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{c.total.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
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
                <td colSpan={3} className="px-4 py-2 text-right">
                  Totales:
                </td>
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
