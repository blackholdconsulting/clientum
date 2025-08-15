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

export default function NuevaFacturaActions() {
  const [busy, setBusy] = useState<null | "pdf" | "xml" | "sign">(null);

  // Si ya tienes un endpoint PDF propio, mantenlo:
  async function handlePdf() {
    try {
      setBusy("pdf");
      const d = collectInvoiceFromForm();
      // Tu endpoint PDF (ajústalo si el tuyo es otro)
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

  async function handleFacturae() {
    try {
      setBusy("xml");
      const d = collectInvoiceFromForm();
      const blob = await signFacturaeXML(d);
      downloadBlob(blob, xmlFileName(d.serie, d.numero, true));
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  async function handleVerifactu() {
    try {
      setBusy("sign");
      const d = collectInvoiceFromForm();
      const { rf, qr } = await verifactuAlta(d);
      console.log("RF:", rf);

      // Si el micro devuelve { qr: { pngDataUrl: "data:image/png;base64,..." } }
      const dataUrl = qr?.pngDataUrl || qr?.dataUrl || "";
      if (dataUrl.startsWith("data:image/")) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `verifactu-qr-${d.serie}${d.numero}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("QR generado (no es data URL). Revisa consola para ver el JSON.");
      }
      alert("VERI*FACTU generado. Consulta la consola/log si necesitas guardar el RF.");
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-3 justify-end mb-4">
      <button
        onClick={handlePdf}
        disabled={!!busy}
        className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
      >
        {busy === "pdf" ? "Generando..." : "Descargar PDF"}
      </button>

      <button
        onClick={handleFacturae}
        disabled={!!busy}
        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy === "xml" ? "Firmando..." : "Descargar Facturae (XAdES)"}
      </button>

      <button
        onClick={handleVerifactu}
        disabled={!!busy}
        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy === "sign" ? "Generando..." : "VERI*FACTU (RF + QR)"}
      </button>
    </div>
  );
}
