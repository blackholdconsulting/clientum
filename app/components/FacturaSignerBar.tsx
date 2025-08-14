"use client";

import { useEffect, useState } from "react";
import {
  prefillEmitterFromProfile,
  collectInvoice,
  buildFacturaeXML,
  signFacturaeXML,
  downloadBlob,
  pdfFileName,
  xmlFileName,
} from "@/lib/invoice-signer";

export default function FacturaSignerBar() {
  const [busy, setBusy] = useState<null | "pdf" | "xml" | "sign">(null);

  useEffect(() => {
    // Clona emisor desde el perfil si está vacío
    prefillEmitterFromProfile();
  }, []);

  async function handleDownloadXML() {
    try {
      setBusy("xml");
      const d = collectInvoice();
      const xml = buildFacturaeXML(d);
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      downloadBlob(blob, `facturae-${d.serie}${d.numero}.xml`);
    } catch (e: any) {
      alert(e.message || "Error generando XML");
    } finally {
      setBusy(null);
    }
  }

  async function handleSignXades() {
    try {
      setBusy("sign");
      const d = collectInvoice();
      const xml = buildFacturaeXML(d);
      const signed = await signFacturaeXML(xml); // 401 FIX → va por /api/sign/xml
      downloadBlob(signed, `facturae-${d.serie}${d.numero}-signed.xades`);
    } catch (e: any) {
      alert(e.message || "Error firmando XML");
    } finally {
      setBusy(null);
    }
  }

  // Si ya tienes un botón de PDF que funciona, deja el tuyo y no uses este.
  async function handlePdf() {
    try {
      setBusy("pdf");
      // Llama a tu endpoint existente de PDF.
      // Si el tuyo era, por ejemplo, /api/facturas/pdf, déjalo igual:
      const d = collectInvoice();
      const resp = await fetch(`/api/facturas/pdf?serie=${encodeURIComponent(d.serie)}&numero=${encodeURIComponent(d.numero)}`);
      if (!resp.ok) throw new Error(`Error generando PDF: ${resp.status}`);
      const blob = await resp.blob();
      downloadBlob(blob, `factura-${d.serie}${d.numero}.pdf`);
    } catch (e: any) {
      alert(e.message || "Error generando PDF");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        type="button"
        onClick={handlePdf}
        className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-60"
        disabled={!!busy}
      >
        {busy === "pdf" ? "Generando PDF…" : "Descargar PDF"}
      </button>

      <button
        type="button"
        onClick={handleDownloadXML}
        className="rounded-md bg-emerald-700 text-white px-3 py-2 text-sm hover:bg-emerald-600 disabled:opacity-60"
        disabled={!!busy}
      >
        {busy === "xml" ? "Generando XML…" : "Descargar Facturae"}
      </button>

      <button
        type="button"
        onClick={handleSignXades}
        className="rounded-md bg-indigo-700 text-white px-3 py-2 text-sm hover:bg-indigo-600 disabled:opacity-60"
        disabled={!!busy}
      >
        {busy === "sign" ? "Firmando…" : "Firmar y descargar Facturae (XAdES)"}
      </button>
    </div>
  );
}
