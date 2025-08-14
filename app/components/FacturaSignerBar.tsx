"use client";

import { useState } from "react";
import {
  collectInvoiceFromForm,
  signFacturaeXML,
  verifactuAlta,
  downloadBlob,
  xmlFileName,
  pdfFileName,
} from "@/lib/invoice-signer";

export default function FacturaSignerBar() {
  const [busy, setBusy] = useState<null | "pdf" | "xml" | "verifactu">(null);

  async function onPdf() {
    try {
      setBusy("pdf");
      const d = collectInvoiceFromForm();
      // Usa tu endpoint PDF existente (ajústalo si es otro)
      const resp = await fetch(
        `/api/facturas/pdf?serie=${encodeURIComponent(d.serie)}&numero=${encodeURIComponent(d.numero)}`
      );
      if (!resp.ok) throw new Error(`Error generado PDF: ${resp.status}`);
      const blob = await resp.blob();
      downloadBlob(blob, pdfFileName(d.serie, d.numero));
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  async function onFacturae() {
    try {
      setBusy("xml");
      const data = collectInvoiceFromForm();
      const blob = await signFacturaeXML(data);
      downloadBlob(blob, xmlFileName(data.serie, data.numero, true));
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  async function onVerifactu() {
    try {
      setBusy("verifactu");
      const data = collectInvoiceFromForm();
      const { rf, qr } = await verifactuAlta(data);

      // Si el micro devuelve un PNG embebido en data URL:
      const dataUrl = qr?.pngDataUrl || qr?.dataUrl || "";
      if (dataUrl.startsWith("data:image/")) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `verifactu-qr-${data.serie}${data.numero}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      console.log("RF VERI*FACTU:", rf);
      alert("VERI*FACTU generado. El RF está en consola/log.");
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-3 justify-end mb-4">
      <button
        onClick={onPdf}
        disabled={!!busy}
        className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
      >
        {busy === "pdf" ? "Generando..." : "Descargar PDF"}
      </button>

      <button
        onClick={onFacturae}
        disabled={!!busy}
        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy === "xml" ? "Firmando..." : "Descargar Facturae (XAdES)"}
      </button>

      <button
        onClick={onVerifactu}
        disabled={!!busy}
        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy === "verifactu" ? "Generando..." : "VERI*FACTU (RF + QR)"}
      </button>
    </div>
  );
}
