// File: /app/gastos/amortizaciones/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Activo {
  id: string;
  nombre: string;
}

interface Amort {
  id: string;
  fecha: string;
  cuota: number;
  acumulada: number;
  activo: { nombre: string }[];
}

export default function LibroAmortizacionesPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [datos, setDatos] = useState<Amort[]>([]);
  const [loading, setLoading] = useState(false);

  // CRUD state
  const [editId, setEditId] = useState<string | null>(null);
  const [fecha, setFecha] = useState("");
  const [activoId, setActivoId] = useState("");
  const [cuota, setCuota] = useState<number | "">("");
  const [acumulada, setAcumulada] = useState<number | "">("");

  // filtro Hasta
  const [hasta, setHasta] = useState("");

  // cargar activos para select
  useEffect(() => {
    supabase
      .from("activos")
      .select("id, nombre")
      .order("nombre")
      .then(({ data, error }) => {
        if (error) console.error("activos load error:", error);
        else setActivos(data || []);
      });
  }, []);

  // función para traer amortizaciones
  const fetchAmort = () => {
    if (!hasta) return;
    setLoading(true);
    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from("amortizaciones")
          .select(`
            id,
            fecha,
            cuota,
            acumulada,
            activo:activos(nombre)
          `)
          .eq("user_id", uid)
          .lte("fecha", hasta)
          .order("fecha", { ascending: true })
      )
      .then(({ data, error }) => {
        if (error) console.error("fetchAmort error:", error);
        else setDatos((data ?? []) as unknown as Amort[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchAmort, [hasta]);

  // iniciar edición
  const startEdit = (a: Amort) => {
    setEditId(a.id);
    setFecha(a.fecha);
    setCuota(a.cuota);
    setAcumulada(a.acumulada);
    const act = activos.find((x) => x.nombre === a.activo[0]?.nombre);
    setActivoId(act?.id || "");
  };

  // cancelar edición
  const cancelEdit = () => {
    setEditId(null);
    setFecha("");
    setActivoId("");
    setCuota("");
    setAcumulada("");
  };

  // alta / actualización
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !activoId || cuota === "" || acumulada === "") {
      alert("Rellena todos los campos");
      return;
    }
    setLoading(true);

    const cuotaNum = Number(cuota);
    const acumNum = Number(acumulada);

    const {
      data: { session },
      error: sessErr,
    } = await supabase.auth.getSession();
    if (sessErr || !session?.user.id) {
      console.error("No session", sessErr);
      setLoading(false);
      return;
    }

    if (editId) {
      // update
      const { error: updErr } = await supabase
        .from("amortizaciones")
        .update({ fecha, activo_id: activoId, cuota: cuotaNum, acumulada: acumNum })
        .eq("id", editId);
      if (updErr) {
        console.error("update error", updErr);
        alert("Error al actualizar: " + updErr.message);
      } else {
        cancelEdit();
        fetchAmort();
      }
    } else {
      // insert
      const { data: insData, error: insErr } = await supabase
        .from("amortizaciones")
        .insert({
          user_id: session.user.id,
          fecha,
          activo_id: activoId,
          cuota: cuotaNum,
          acumulada: acumNum,
        })
        .select();
      if (insErr) {
        console.error("insert error", insErr);
        alert("Error al guardar: " + insErr.message);
      } else {
        // feedback inmediato
        setDatos((prev) => [
          ...prev,
          {
            ...(insData![0] as any),
            activo: activos.filter((x) => x.id === activoId).map((x) => ({ nombre: x.nombre })),
          },
        ]);
        cancelEdit();
      }
    }

    setLoading(false);
  };

  // eliminar
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta amortización?")) return;
    const { error } = await supabase.from("amortizaciones").delete().eq("id", id);
    if (error) {
      console.error("delete error", error);
      alert("Error al eliminar: " + error.message);
    } else {
      setDatos((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // sumatorios
  const sumCuota = datos.reduce((s, a) => s + a.cuota, 0);
  const sumAcum = datos.reduce((s, a) => s + a.acumulada, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📗 Libro de Amortizaciones</h1>

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
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Activo</label>
          <select
            value={activoId}
            onChange={(e) => setActivoId(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          >
            <option value="">— Selecciona —</option>
            {activos.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Cuota</label>
          <input
            type="number"
            value={cuota}
            onChange={(e) => setCuota(+e.target.value)}
            className="border rounded px-2 py-1 w-full"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Acumulada</label>
          <input
            type="number"
            value={acumulada}
            onChange={(e) => setAcumulada(+e.target.value)}
            className="border rounded px-2 py-1 w-full"
            step="0.01"
            required
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
            : "Añadir Amortización"}
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

      {/* filtro Hasta */}
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
        <button
          onClick={fetchAmort}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Aplicar filtro
        </button>
      </div>

      {/* export */}
      <div className="flex space-x-4">
        <CSVLink
          data={datos.map((a) => ({
            ...a,
            activo: a.activo[0]?.nombre ?? "",
          }))}
          filename={`amortizaciones_${hasta}.csv`}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Exportar CSV
        </CSVLink>
        <button
          onClick={() => window.open(`/gastos/amortizaciones/export.pdf?hasta=${hasta}`, "_blank")}
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
              <th className="px-4 py-2 text-left">Activo</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-right">Cuota</th>
              <th className="px-4 py-2 text-right">Acumulada</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No hay datos
                </td>
              </tr>
            ) : (
              datos.map((a) => (
                <tr key={a.id} className="border-t even:bg-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2">{a.activo[0]?.nombre}</td>
                  <td className="px-4 py-2">{a.fecha}</td>
                  <td className="px-4 py-2 text-right">{a.cuota.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{a.acumulada.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => startEdit(a)}
                      className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
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
                <td colSpan={2} className="px-4 py-2 text-right">
                  Totales:
                </td>
                <td className="px-4 py-2 text-right">{sumCuota.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{sumAcum.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
