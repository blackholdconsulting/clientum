"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Row = Record<string, any>;

export default function FacturaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [row, setRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // names de columnas
  const [colSerie, setColSerie] = useState("serie");
  const [colNumero, setColNumero] = useState("number");
  const [colNotas, setColNotas] = useState("notas");
  const [colEstado, setColEstado] = useState("status");
  const [colRf, setColRf] = useState("rf");
  const [colQr, setColQr] = useState("verifactu_qr_data_url");

  async function exists(col: string) {
    const { error } = await supabase.from("facturas").select(col).eq("id", id).limit(1);
    return !(error && (error as any).code === "42703");
  }
  async function pick(cols: string[], fallback: string) {
    for (const c of cols) if (await exists(c)) return c;
    return fallback;
  }

  useEffect(() => {
    (async () => {
      setColSerie(await pick(["serie", "series"], "serie"));
      setColNumero(await pick(["number", "num", "numero"], "number"));
      setColNotas((await exists("notas")) ? "notas" : (await exists("notes")) ? "notes" : "notes");
      setColEstado((await exists("status")) ? "status" : (await exists("estado")) ? "estado" : "status");
      setColRf((await exists("rf")) ? "rf" : "rf");
      setColQr((await exists("verifactu_qr_data_url")) ? "verifactu_qr_data_url" : "verifactu_qr_data_url");
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    const { data, error } = await supabase.from("facturas").select("*").eq("id", id).single();
    if (error) {
      alert(error.message);
      router.push("/facturas/historico");
      return;
    }
    setRow(data);
  }

  function setField(k: string, v: any) {
    if (!row) return;
    setRow({ ...row, [k]: v });
  }

  async function save() {
    if (!row) return;
    setBusy("save");
    try {
      const payload: any = {
        [colSerie]: row[colSerie],
        [colNumero]: row[colNumero],
        [colNotas]: row[colNotas] ?? "",
      };
      const res = await fetch(`/api/facturas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error ?? "No se pudo guardar");
      } else {
        setRow(j.data);
      }
    } finally {
      setBusy(null);
    }
  }

  async function del() {
    if (!confirm("¿Eliminar esta factura?")) return;
    setBusy("del");
    try {
      const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error ?? "No se pudo eliminar");
        return;
      }
      router.push("/facturas/historico");
    } finally {
      setBusy(null);
    }
  }

  function openPdf() {
    if (!row) return;
    const serie = row[colSerie];
    const numero = row[colNumero];
    if (!serie || numero == null) return alert("Faltan serie/número");
    window.open(`/api/facturas/pdf?serie=${encodeURIComponent(serie)}&numero=${encodeURIComponent(numero)}`, "_blank");
  }

  function openFacturae() {
    if (!row) return;
    const serie = row[colSerie];
    const numero = row[colNumero];
    if (!serie || numero == null) return alert("Faltan serie/número");
    window.open(`/api/facturas/xml?serie=${encodeURIComponent(serie)}&numero=${encodeURIComponent(numero)}`, "_blank");
  }

  async function doVerifactu() {
    setBusy("vf");
    try {
      const res = await fetch(`/api/facturas/${id}/verifactu`, { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j?.error ?? "No se pudo registrar en Veri*factu");
      } else {
        await load();
        alert(`Registrada en Veri*factu. RF: ${j?.rf ?? ""}`);
      }
    } finally {
      setBusy(null);
    }
  }

  if (!row) return <div className="p-8">Cargando…</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Factura {row[colSerie]}-{row[colNumero]}
        </h1>
        <Link href="/facturas/historico" className="text-blue-600 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm">Serie</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={row[colSerie] ?? ""}
            onChange={(e) => setField(colSerie, e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm">Número</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={row[colNumero] ?? ""}
            onChange={(e) => setField(colNumero, Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm">Estado</label>
          <input className="w-full border rounded px-3 py-2" value={row[colEstado] ?? ""} disabled />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm">Notas</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={row[colNotas] ?? ""}
            onChange={(e) => setField(colNotas, e.target.value)}
          />
        </div>
      </div>

      {row[colQr] ? (
        <div className="flex items-start gap-4">
          <div>
            <div className="text-sm mb-1">QR Veri*factu</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row[colQr]} alt="QR Veri*factu" className="border rounded p-2 bg-white" />
          </div>
          <div className="text-sm">
            RF: <b>{row[colRf] || "—"}</b>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Aún no registrado en Veri*factu.</div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={save}
          disabled={busy === "save"}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {busy === "save" ? "Guardando…" : "Guardar cambios"}
        </button>
        <button onClick={openPdf} className="px-4 py-2 rounded bg-gray-700 text-white">
          PDF
        </button>
        <button onClick={openFacturae} className="px-4 py-2 rounded bg-slate-600 text-white">
          Facturae
        </button>
        <button
          onClick={doVerifactu}
          disabled={busy === "vf"}
          className="px-4 py-2 rounded bg-amber-600 text-white disabled:opacity-60"
        >
          {busy === "vf" ? "Registrando…" : "VeriFactu"}
        </button>
        <button
          onClick={del}
          disabled={busy === "del"}
          className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60 ml-auto"
        >
          {busy === "del" ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </div>
  );
}
