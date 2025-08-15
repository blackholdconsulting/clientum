"use client";

import { useRef, useState } from "react";
import { collectInvoiceFromForm, signFacturaeXML, downloadBlob, xmlFileName } from "@/lib/invoice-signer";

export default function FacturaElectronicaPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "sign" | "form">(null);

  async function handleSignUploaded() {
    try {
      setBusy("sign");
      const f = fileRef.current?.files?.[0];
      if (!f) return alert("Selecciona un XML de Facturae.");
      const xml = await f.text();

      // Firmar XML ya preparado (si tu micro soporta /api/sign/xml directo, puedes crear otro proxy).
      // Aquí usamos el proxy que compone desde {invoice}. Si quieres firmar XML subido, crea /api/sign/xml aparte.
      alert("Para firmar un XML subido directamente, expón /api/sign/xml en tu micro y crea un proxy /api/sign/xml.");
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  async function handleSignFromForm() {
    try {
      setBusy("form");
      const d = collectInvoiceFromForm();
      const blob = await signFacturaeXML(d);
      downloadBlob(blob, xmlFileName(d.serie, d.numero, true));
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Factura electrónica (Facturae 3.2.2)</h1>

      <div className="rounded border p-4 space-y-3">
        <h2 className="font-medium">1) Firmar XML subido</h2>
        <input ref={fileRef} type="file" accept=".xml" className="block" />
        <button
          onClick={handleSignUploaded}
          disabled={!!busy}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy === "sign" ? "Firmando..." : "Firmar XML (subido)"}
        </button>
        <p className="text-sm text-slate-500">
          * Para firmar un XML ya generado directamente, crea un proxy <code>/api/sign/xml</code> que apunte a{" "}
          <code>{`POST ${process.env.SIGNER_BASE_URL}/api/sign/xml`}</code>.
        </p>
      </div>

      <div className="rounded border p-4 space-y-3">
        <h2 className="font-medium">2) Firmar a partir del formulario de factura</h2>
        <button
          onClick={handleSignFromForm}
          disabled={!!busy}
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy === "form" ? "Firmando..." : "Firmar y descargar Facturae (XAdES)"}
        </button>
        <p className="text-sm text-slate-500">Lee los campos de tu formulario actual y genera el XML firmado.</p>
      </div>
    </div>
  );
}
