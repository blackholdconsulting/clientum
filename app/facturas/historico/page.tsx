"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Row = Record<string, any>;

type Norm = {
  id: string;
  fecha: string | null;
  cliente: string;
  importe: number;
  estado: string;
  serie?: string;
  numero?: number;
};

export default function HistoricoFacturasPage() {
  const supabase = createClientComponentClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [list, setList] = useState<Norm[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [fCli, setFCli] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [impMin, setImpMin] = useState<string>("");
  const [impMax, setImpMax] = useState<string>("");

  // columnas reales (autodetección sencilla)
  const [colFecha, setColFecha] = useState("issued_at");
  const [colCliente, setColCliente] = useState("cliente");
  const [colImporte, setColImporte] = useState("total");
  const [colEstado, setColEstado] = useState("status");
  const [colSerie, setColSerie] = useState("serie");
  const [colNumero, setColNumero] = useState("number");
  const [colUserId, setColUserId] = useState("user_id");

  async function exists(col: string) {
    const { error } = await supabase.from("facturas").select(col).limit(1);
    // si code === 42703 => columna no existe
    return !(error && (error as any).code === "42703");
  }
  async function pick(cols: string[], fallback: string) {
    for (const c of cols) if (await exists(c)) return c;
    return fallback;
  }

  useEffect(() => {
    (async () => {
      setColFecha(await pick(["issued_at", "fecha", "created_at"], "created_at"));
      setColCliente(await pick(["cliente", "customer_name", "client_name", "client"], "cliente"));
      setColImporte(await pick(["total", "importe", "total_amount", "amount"], "total"));
      setColEstado(await pick(["status", "estado"], "status"));
      setColSerie(await pick(["serie", "series"], "serie"));
      setColNumero(await pick(["number", "num", "numero"], "number"));
      setColUserId((await exists("user_id")) ? "user_id" : "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      let q = supabase.from("facturas").select("*");

      // multiusuario por user_id (si existe)
      if (colUserId) {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (uid) q = q.eq(colUserId, uid);
      }

      if (fCli) q = q.eq(colCliente, fCli);
      if (desde) q = q.gte(colFecha, desde);
      if (hasta) q = q.lte(colFecha, hasta);
      if (impMin) q = q.gte(colImporte, Number(impMin));
      if (impMax) q = q.lte(colImporte, Number(impMax));
      q = q.order(colFecha, { ascending: false });

      const { data, error } = await q;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows(data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!colImporte || !colFecha) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colFecha, colCliente, colImporte, colEstado, colSerie, colNumero, colUserId, fCli, desde, hasta, impMin, impMax]);

  useEffect(() => {
    const n = rows.map((r) => {
      const fecha: string | null = r[colFecha] ? String(r[colFecha]) : null;
      const cliente: string = r[colCliente] ?? "—";
      const importe: number = Number(r[colImporte] ?? 0) || 0;
      const estado: string = r[colEstado] ?? "borrador";
      const serie: string | undefined = r[colSerie];
      const numero: number | undefined = r[colNumero];
      return {
        id: String(r.id),
        fecha,
        cliente,
        importe,
        estado,
        serie,
        numero,
      } as Norm;
    });
    setList(n);
  }, [rows, colFecha, colCliente, colImporte, colEstado, colSerie, colNumero]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "No se pudo eliminar");
      return;
    }
    await load();
  }

  function openPdf(row: Norm) {
    // usa tu endpoint existente basado en serie/numero
    if (!row.serie || row.numero == null) {
      alert("No hay serie/número en esta factura.");
      return;
    }
    window.open(
      `/api/facturas/pdf?serie=${encodeURIComponent(row.serie)}&numero=${encodeURIComponent(
        row.numero
      )}`,
      "_blank"
    );
  }

  function openFacturae(row: Norm) {
    if (!row.serie || row.numero == null) {
      alert("No hay serie/número en esta factura.");
      return;
    }
    window.open(
      `/api/facturas/xml?serie=${encodeURIComponent(row.serie)}&numero=${encodeURIComponent(
        row.numero
      )}`,
      "_blank"
    );
  }

  async function doVerifactu(row: Norm) {
    const res = await fetch(`/api/facturas/${row.id}/verifactu`, { method: "POST" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(j?.error ?? "No se pudo registrar en Veri*factu");
      return;
    }
    alert(`Registrada. RF: ${j?.rf ?? ""}`);
    await load();
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Histórico de Facturas</h1>

      {/* filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div>
          <label className="text-sm">Cliente</label>
          <input
            value={fCli}
            onChange={(e) => setFCli(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white"
            placeholder="Filtrar por cliente"
          />
        </div>
        <div>
          <label className="text-sm">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm">Imp. Min</label>
          <input
            type="number"
            value={impMin}
            onChange={(e) => setImpMin(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm">Imp. Max</label>
          <input
            type="number"
            value={impMax}
            onChange={(e) => setImpMax(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Importe</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">
                  <Link className="text-blue-600 hover:underline" href={`/facturas/${r.id}`}>
                    {r.fecha ? format(new Date(r.fecha), "dd/MM/yyyy") : "—"}
                  </Link>
                </td>
                <td className="px-4 py-2">{r.cliente || "—"}</td>
                <td className="px-4 py-2">€ {r.importe.toFixed(2)}</td>
                <td className="px-4 py-2 capitalize">{r.estado || "borrador"}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/facturas/${r.id}`} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                      Editar
                    </Link>
                    <button onClick={() => openPdf(r)} className="px-3 py-1 rounded bg-gray-700 text-white text-sm">
                      PDF
                    </button>
                    <button onClick={() => openFacturae(r)} className="px-3 py-1 rounded bg-slate-500 text-white text-sm">
                      Facturae
                    </button>
                    <button onClick={() => doVerifactu(r)} className="px-3 py-1 rounded bg-amber-600 text-white text-sm">
                      VeriFactu
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No hay facturas
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
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
