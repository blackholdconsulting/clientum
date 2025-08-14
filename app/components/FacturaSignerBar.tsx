"use client";

import { useState } from "react";
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

  async function handlePrefill() {
    try {
      const d = await prefillEmitterFromProfile();
      // Si tu formulario ya está lleno, esto no hace nada; si no, intenta volcar por ids/names comunes
      const setVal = (key: string, val?: string) => {
        const el =
          document.querySelector<HTMLInputElement>(`[name="${key}"]`) ||
          document.querySelector<HTMLInputElement>(`#${key}`) ||
          document.querySelector<HTMLInputElement>(`[data-field="${key}"]`);
        if (el && val != null) el.value = val;
      };
      setVal("emisorNombre", d.nombre);
      setVal("emisor_razonSocial", d.nombre);
      setVal("razonSocial", d.nombre);
      setVal("emisorNIF", d.nif);
      setVal("emisor_nif", d.nif);
      setVal("nif", d.nif);
      setVal("emisorDireccion", d.direccion);
      setVal("direccion", d.direccion);
      setVal("emisorLocalidad", d.localidad);
      setVal("localidad", d.localidad);
      setVal("emisorProvincia", d.provincia);
      setVal("provincia", d.provincia);
      setVal("emisorCP", d.cp);
      setVal("cp", d.cp);
      setVal("emisorEmail", d.email);
      setVal("email", d.email);
      setVal("emisorTelefono", d.telefono);
      setVal("telefono", d.telefono);
      alert("Datos del emisor volcados desde tu perfil.");
    } catch (e: any) {
      console.error(e);
      alert("No se pudo volcar el emisor desde el perfil.");
    }
  }

  async function handlePDF() {
    try {
      setBusy("pdf");
      const d = collectInvoice();
      const serie = d.serie ?? "";
      const numero = d.numero ?? "";
      // Ajusta este endpoint si tu app usa otro (GET/POST). Aquí se usa GET con query.
      const resp = await fetch(
        `/api/facturas/pdf?serie=${encodeURIComponent(serie)}&numero=${encodeURIComponent(numero)}`
      );
      if (!resp.ok) throw new Error(`Error generando PDF: ${resp.status}`);
      const blob = await resp.blob();
      downloadBlob(blob, pdfFileName(d));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error al generar el PDF");
    } finally {
      setBusy(null);
    }
  }

  async function handleXML() {
    try {
      setBusy("xml");
      const d = collectInvoice();
      const xml = buildFacturaeXML(d);
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      downloadBlob(blob, xmlFileName(d));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error al generar el XML");
    } finally {
      setBusy(null);
    }
  }

  async function handleSign() {
    try {
      setBusy("sign");
      const d = collectInvoice();
      const xml = buildFacturaeXML(d);
      const blob = await signFacturaeXML(xml); // proxy a /api/sign (Node runtime)
      // Si quieres distinguir, podrías renombrar a -firmada.xml
      downloadBlob(blob, xmlFileName(d));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error al firmar el XML");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        type="button"
        onClick={handlePrefill}
        className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 border"
        disabled={busy !== null}
        title="Volcar emisor desde tu perfil"
      >
        Volcar emisor
      </button>

      <button
        type="button"
        onClick={handlePDF}
        className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        disabled={busy === "pdf"}
      >
        {busy === "pdf" ? "Generando PDF..." : "Descargar PDF"}
      </button>

      <button
        type="button"
        onClick={handleXML}
        className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        disabled={busy === "xml"}
      >
        {busy === "xml" ? "Generando XML..." : "Exportar XML"}
      </button>

      <button
        type="button"
        onClick={handleSign}
        className="px-3 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
        disabled={busy === "sign"}
      >
        {busy === "sign" ? "Firmando..." : "Firmar XML"}
      </button>
    </div>
  );
}
