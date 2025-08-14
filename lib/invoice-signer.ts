// Funciones reutilizables para leer tu formulario actual y llamar a los proxies

export type FacturaMin = {
  emisor: {
    nombre: string;
    nif: string;
    direccion?: string;
    localidad?: string;
    provincia?: string;
  };
  serie: string;
  numero: string;
  fecha: string; // ISO yyyy-MM-dd o dd/MM/yyyy
  totales: {
    baseImponible: number;
    tipoIVA: number;
    cuotaIVA?: number;
    importeTotal?: number;
  };
  software?: { nombre: string; version: string };
};

// --- Utilidades DOM (no cambia tu formato) -----------------------------

function v(idOrName: string): string {
  // Busca por [name] y si no por [id]
  const byName = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `[name="${idOrName}"]`
  );
  if (byName) return (byName.value ?? "").trim();

  const byId = document.getElementById(idOrName) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  if (byId) return (byId.value ?? "").trim();

  return "";
}

function toNumber(s: string): number {
  if (!s) return 0;
  // admite coma o punto
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return isFinite(n) ? n : 0;
}

function normFecha(fecha: string): string {
  // admite dd/MM/yyyy o yyyy-MM-dd
  if (!fecha) return new Date().toISOString().slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("/");
    return `${y}-${m}-${d}`;
  }
  return fecha;
}

// --- Lectura del formulario de "Nueva factura" ------------------------

/**
 * Lee tu formulario actual SIN cambiarlo.
 * Ajusta los "names" aquí si en tu form son otros.
 */
export function collectInvoiceFromForm(): FacturaMin {
  const base = toNumber(v("base") || v("baseImponible"));
  const tipo = toNumber(v("tipoiva") || v("tipoIVA"));
  // Si el usuario no rellena cuota/total, los calculamos
  const cuota = toNumber(v("cuotaiva") || v("cuotaIVA")) || +(base * tipo / 100).toFixed(2);
  const total = toNumber(v("importetotal") || v("importeTotal")) || +(base + cuota).toFixed(2);

  return {
    emisor: {
      nombre: v("emisor_nombre") || v("nombre_razon_social") || v("emisorNombre") || "",
      nif: v("emisor_nif") || v("nif") || v("emisorNif") || "",
      direccion: v("emisor_direccion") || v("direccion"),
      localidad: v("emisor_localidad") || v("localidad"),
      provincia: v("emisor_provincia") || v("provincia"),
    },
    serie: v("serie") || "A",
    numero: v("numero") || "0001",
    fecha: normFecha(v("fecha")),
    totales: {
      baseImponible: base,
      tipoIVA: tipo,
      cuotaIVA: cuota,
      importeTotal: total,
    },
    software: { nombre: "Clientum", version: "0.0.1" },
  };
}

// --- Llamadas a tus proxies ------------------------------------------

export async function signFacturaeXML(invoice: FacturaMin): Promise<Blob> {
  const resp = await fetch("/api/factura-electronica", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice }),
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Error firmando XML (${resp.status}): ${text || resp.statusText}`);
  // Lo devolvemos como Blob para descargar
  return new Blob([text], { type: "application/xml;charset=utf-8" });
}

export async function verifactuAlta(invoice: FacturaMin): Promise<{ rf: any; qr: any }> {
  const resp = await fetch("/api/verifactu/alta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice }),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(`Error VERI*FACTU (${resp.status}): ${json?.error || resp.statusText}`);
  return json;
}

// --- Descargas --------------------------------------------------------

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function xmlFileName(serie: string, numero: string, signed = true) {
  return `factura-${(serie || "").trim()}${(numero || "").trim() || "0001"}${signed ? "-signed" : ""}.xml`;
}

export function pdfFileName(serie: string, numero: string) {
  return `factura-${(serie || "").trim()}${(numero || "").trim() || "0001"}.pdf`;
}
