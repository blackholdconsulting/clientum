"use client";

import { useRef, useState } from "react";

type RFInput = {
  emisorNIF: string;
  serie: string;
  numero: string;
  fechaExpedicion?: string; // yyyy-MM-dd
  importeTotal: number;
  baseImponible: number;
  cuotaIVA: number;
  tipoIVA: number;
  software?: { nombre: string; version: string };
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AeatActions({
  rfDefault,
  title = "Homologación AEAT",
}: {
  rfDefault?: Partial<RFInput>;
  title?: string;
}) {
  // -------- Firma XML --------
  const xmlInputRef = useRef<HTMLInputElement | null>(null);
  const [signLoading, setSignLoading] = useState(false);

  async function onSignXml() {
    const file = xmlInputRef.current?.files?.[0];
    if (!file) {
      alert("Selecciona un XML primero.");
      return;
    }
    try {
      setSignLoading(true);
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/sign/xml", { method: "POST", body: form });
      const buf = await res.arrayBuffer();

      if (!res.ok) {
        let msg = "Error firma";
        try {
          msg += " " + new TextDecoder().decode(buf);
        } catch {}
        alert(msg);
        return;
      }

      const blob = new Blob([buf], { type: "application/xml" });
      const name = file.name.replace(/\.xml$/i, "") + ".signed.xml";
      downloadBlob(blob, name);
      alert("XML firmado correctamente.");
    } catch (e: any) {
      alert(`Error (proxy_error): ${e?.message ?? e}`);
    } finally {
      setSignLoading(false);
    }
  }

  // -------- Veri*factu (RF/QR) --------
  const today = new Date().toISOString().slice(0, 10);
  const [rf, setRf] = useState<RFInput>({
    emisorNIF: rfDefault?.emisorNIF ?? "A12345678",
    serie: rfDefault?.serie ?? "2025A",
    numero: rfDefault?.numero ?? "001",
    fechaExpedicion: rfDefault?.fechaExpedicion ?? today,
    importeTotal: rfDefault?.importeTotal ?? 121.0,
    baseImponible: rfDefault?.baseImponible ?? 100.0,
    cuotaIVA: rfDefault?.cuotaIVA ?? 21.0,
    tipoIVA: rfDefault?.tipoIVA ?? 21.0,
    software: rfDefault?.software ?? { nombre: "Clientum Signer", version: "0.0.1" },
  });

  function bind<K extends keyof RFInput>(k: K) {
    return {
      value:
        typeof rf[k] === "number"
          ? String(rf[k] as number)
          : (rf[k] as string | undefined) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setRf((s) => ({
          ...s,
          [k]:
            k === "importeTotal" || k === "baseImponible" || k === "cuotaIVA" || k === "tipoIVA"
              ? Number(e.target.value)
              : e.target.value,
        })),
    };
  }

  async function postRF() {
    const res = await fetch("/api/verifactu/rf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rf),
    });
    const text = await res.text();
    if (!res.ok) {
      alert(`Error RF (${res.status}): ${text}`);
      return;
    }
    const blob = new Blob([text], { type: "application/json" });
    downloadBlob(blob, `rf_${rf.serie}_${rf.numero}.json`);
    alert("RF generado y descargado.");
  }

  async function postQR() {
    const res = await fetch("/api/verifactu/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rf),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      alert(`Error QR (${res.status}): ${t}`);
      return;
    }
    const blob = await res.blob();
    downloadBlob(blob, `qr_${rf.serie}_${rf.numero}.png`);
    alert("QR generado y descargado.");
  }

  // --- UI neutra (no cambia tu formato general) ---
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{title}</h3>

      {/* Firma XML */}
      <div style={{ border: "1px solid #f3f4f6", borderRadius: 8, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>1) Firmar factura (XML)</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input ref={xmlInputRef} type="file" accept=".xml" />
          <button
            onClick={onSignXml}
            disabled={signLoading}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "8px 12px",
              opacity: signLoading ? 0.6 : 1,
              cursor: signLoading ? "not-allowed" : "pointer",
            }}
          >
            {signLoading ? "Firmando..." : "Firmar XML"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          Llama a <code>/api/sign/xml</code> (proxy) y descarga <code>.signed.xml</code>.
        </div>
      </div>

      {/* Veri*factu RF/QR */}
      <div style={{ border: "1px solid #f3f4f6", borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>2) Veri*factu (RF + QR)</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 8,
            maxWidth: 700,
          }}
        >
          <label style={{ fontSize: 14 }}>
            Emisor NIF
            <input {...bind("emisorNIF")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Serie
            <input {...bind("serie")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Número
            <input {...bind("numero")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Fecha expedición
            <input type="date" {...bind("fechaExpedicion")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Importe total
            <input type="number" step="0.01" {...bind("importeTotal")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Base imponible
            <input type="number" step="0.01" {...bind("baseImponible")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Cuota IVA
            <input type="number" step="0.01" {...bind("cuotaIVA")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
          <label style={{ fontSize: 14 }}>
            Tipo IVA (%)
            <input type="number" step="0.01" {...bind("tipoIVA")} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6 }} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button
            onClick={postRF}
            style={{ background: "#059669", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}
          >
            Generar RF (JSON)
          </button>
          <button
            onClick={postQR}
            style={{ background: "#4f46e5", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}
          >
            Generar QR (PNG)
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
          Llama a <code>/api/verifactu/rf</code> y <code>/api/verifactu/qr</code> (proxy Next → microservicio).
        </div>
      </div>
    </div>
  );
}
