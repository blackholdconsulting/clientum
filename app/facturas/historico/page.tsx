// app/facturas/historico/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";

type Row = Record<string, any>;

type Normal = {
  id: string;
  fecha: string | null;
  cliente: string;
  importe: number;
  estado: string;
};

export default function HistoricoFacturasPage() {
  const supabase = createClientComponentClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [norm, setNorm] = useState<Normal[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [minImporte, setMinImporte] = useState<number | "">("");
  const [maxImporte, setMaxImporte] = useState<number | "">("");

  // Columnas reales (autodetección)
  const [dateCol, setDateCol] = useState<string>("");      // issued_at | fecha | created_at
  const [clientCol, setClientCol] = useState<string>("");  // cliente | customer_name | client_name
  const [totalCol, setTotalCol] = useState<string>("");    // importe | total | total_amount
  const [statusCol, setStatusCol] = useState<string>("");  // estado | status
  const [userIdCol, setUserIdCol] = useState<string>("");  // user_id si existe

  // --- util: comprueba si existe una columna en 'facturas'
  const columnExists = async (col: string) => {
    const { error } = await supabase.from("facturas").select(col).limit(1);
    // Error 42703 => undefined column
    if (error && (error as any).code === "42703") return false;
    // Si hay otra cosa (p.ej. RLS sin filas), lo consideramos existente
    return true;
  };

  // --- elige la primera columna que exista
  const pickFirstExisting = async (candidates: string[]) => {
    for (const c of candidates) {
      if (await columnExists(c)) return c;
    }
    return ""; // ninguna
  };

  // Detecta columnas una vez
  useEffect(() => {
    (async () => {
      const dc = await pickFirstExisting(["issued_at", "fecha", "created_at"]);
      const cc = await pickFirstExisting(["cliente", "customer_name", "client_name", "client"]);
      const tc = await pickFirstExisting(["importe", "total", "total_amount", "amount"]);
      const sc = await pickFirstExisting(["estado", "status"]);
      const uc = (await columnExists("user_id")) ? "user_id" : "";

      setDateCol(dc);
      setClientCol(cc);
      setTotalCol(tc);
      setStatusCol(sc);
      setUserIdCol(uc);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga clientes únicos para el select
  useEffect(() => {
    (async () => {
      if (!clientCol) return;
      const base = supabase.from("facturas").select(clientCol);
      const { data, error } = await base;
      if (!error && data) {
        const uniques = Array.from(
          new Set(
            data
              .map((r) => (r as any)[clientCol])
              .filter(Boolean)
          )
        ) as string[];
        setClientes(uniques);
      }
    })();
  }, [clientCol, supabase]);

  // Carga filas con filtros aplicados
  const load = async () => {
    setLoading(true);
    try {
      let q = supabase.from("facturas").select("*");

      // multiusuario: si hay columna user_id, filtramos por usuario actual
      if (userIdCol) {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (uid) q = q.eq(userIdCol, uid);
      }

      // filtros
      if (filtroCliente && clientCol) q = q.eq(clientCol, filtroCliente);
      if (desde && dateCol) q = q.gte(dateCol, desde);
      if (hasta && dateCol) q = q.lte(dateCol, hasta);
      if (minImporte !== "" && totalCol) q = q.gte(totalCol, minImporte);
      if (maxImporte !== "" && totalCol) q = q.lte(totalCol, maxImporte);

      // orden
      if (dateCol) {
        q = q.order(dateCol, { ascending: false });
      } else if (await columnExists("created_at")) {
        q = q.order("created_at", { ascending: false });
      }

      const { data, error } = await q;
      if (error) {
        // muestra algo útil en el cliente para no “quedarte a oscuras”
        console.error("Error cargando facturas:", error);
        setRows([]);
      } else {
        setRows(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // carga cuando ya sabemos cómo se llaman las columnas clave
    if (!totalCol || (!dateCol && !clientCol)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateCol, clientCol, totalCol, statusCol, userIdCol, filtroCliente, desde, hasta, minImporte, maxImporte]);

  // Normaliza filas a un modelo estable para pintar
  useEffect(() => {
    const n = rows.map((r): Normal => {
      const fechaRaw =
        (dateCol && r[dateCol]) ||
        r["created_at"] ||
        null;

      const cliente =
        (clientCol && (r[clientCol] as string)) ||
        r["cliente"] ||
        r["customer_name"] ||
        r["client_name"] ||
        r["client"] ||
        "—";

      const importeNum = Number(
        (totalCol && r[totalCol]) ??
          r["total"] ??
          r["importe_total"] ??
          r["total_amount"] ??
          r["amount"] ??
          0
      );

      const estado =
        (statusCol && (r[statusCol] as string)) ||
        r["estado"] ||
        r["status"] ||
        "borrador";

      return {
        id: String(r.id ?? `${r.serie ?? ""}-${r.number ?? Math.random()}`),
        fecha: fechaRaw ? String(fechaRaw) : null,
        cliente,
        importe: isNaN(importeNum) ? 0 : importeNum,
        estado,
      };
    });
    setNorm(n);
  }, [rows, dateCol, clientCol, totalCol, statusCol]);

  const canFilterByDates = Boolean(dateCol);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Histórico de Facturas</h1>

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
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input
            type="date"
            disabled={!canFilterByDates}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input
            type="date"
            disabled={!canFilterByDates}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white disabled:opacity-50"
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Imp. Min</label>
            <input
              type="number"
              min={0}
              value={minImporte}
              onChange={(e) =>
                setMinImporte(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2 bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Imp. Max</label>
            <input
              type="number"
              min={0}
              value={maxImporte}
              onChange={(e) =>
                setMaxImporte(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2 bg-white"
            />
          </div>
        </div>
      </div>

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
            {norm.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-4 py-2">
                  {f.fecha ? format(new Date(f.fecha), "dd/MM/yyyy") : "—"}
                </td>
                <td className="px-4 py-2">{f.cliente}</td>
                <td className="px-4 py-2">€ {f.importe.toFixed(2)}</td>
                <td className="px-4 py-2 capitalize">{f.estado}</td>
              </tr>
            ))}
            {!loading && norm.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No hay facturas que coincidan con los filtros.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
