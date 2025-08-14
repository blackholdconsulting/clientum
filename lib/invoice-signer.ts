/* ============================================================================
 * Helpers faltantes para FacturaSignerBar
 *  - prefillEmitterFromProfile(): carga datos del emisor desde /api/profile
 *  - collectInvoice(document?): lee el formulario y construye FacturaMin
 * ----------------------------------------------------------------------------
 * NOTA: Si tus IDs/name de inputs no coinciden con los de abajo,
 *       ajusta los selectores en get() y en la recolección de líneas.
 * ==========================================================================*/

type EmisorMin = {
  nombre?: string;
  nif?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  cp?: string;
  email?: string;
  telefono?: string;
};

type ReceptorMin = {
  nombre?: string;
  nif?: string;
};

type LineaMin = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: number;
};

export type FacturaMin = {
  serie?: string;
  numero?: string;
  fecha?: string; // ISO yyyy-mm-dd
  emisor: EmisorMin;
  receptor: ReceptorMin;
  lineas: LineaMin[];
  totales: {
    baseImponible: number;
    importeIVA: number;
    importeTotal: number;
  };
};

/** Carga el emisor desde tu perfil (/api/profile) y devuelve un objeto parcial. */
export async function prefillEmitterFromProfile(): Promise<Partial<EmisorMin>> {
  try {
    const resp = await fetch("/api/profile", { cache: "no-store" });
    if (!resp.ok) return {};
    const p = await resp.json();

    // Mapeos tolerantes a distintos nombres de campo
    return {
      nombre: p?.razonSocial ?? p?.razon_social ?? p?.nombre ?? "",
      nif: p?.nif ?? p?.cif ?? p?.nif_cif ?? "",
      direccion: p?.direccion ?? p?.address ?? "",
      localidad: p?.localidad ?? p?.city ?? "",
      provincia: p?.provincia ?? p?.state ?? "",
      cp: p?.cp ?? p?.codigo_postal ?? p?.zip ?? "",
      email: p?.email ?? "",
      telefono: p?.telefono ?? p?.phone ?? "",
    };
  } catch {
    return {};
  }
}

/**
 * Lee los valores del formulario actual (document) y construye una FacturaMin.
 * Ajusta selectores si tus inputs usan otros IDs/name.
 */
export function collectInvoice(doc: Document = document): FacturaMin {
  const get = (sel: string): string => {
    // Busca por id, name o data-field
    const el =
      doc.querySelector<HTMLInputElement>(sel) ||
      doc.querySelector<HTMLInputElement>(`[name="${sel}"]`) ||
      doc.querySelector<HTMLInputElement>(`#${sel}`) ||
      doc.querySelector<HTMLInputElement>(`[data-field="${sel}"]`);
    return (el?.value ?? "").toString().trim();
  };

  const toNum = (v: string): number => {
    const x = parseFloat(v.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(x) ? x : 0;
  };

  // --- Cabecera
  const serie = get("serie");
  const numero = get("numero");
  const fecha =
    get("fecha") ||
    new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // --- Emisor (IDs/name típicos; ajusta si usas otros)
  const emisor: EmisorMin = {
    nombre: get("emisorNombre") || get("emisor_razonSocial") || get("razonSocial"),
    nif: get("emisorNIF") || get("emisor_nif") || get("nif"),
    direccion: get("emisorDireccion") || get("direccion"),
    localidad: get("emisorLocalidad") || get("localidad"),
    provincia: get("emisorProvincia") || get("provincia"),
    cp: get("emisorCP") || get("cp"),
    email: get("emisorEmail") || get("email"),
    telefono: get("emisorTelefono") || get("telefono"),
  };

  // --- Receptor (cliente)
  const receptor: ReceptorMin = {
    nombre: get("clienteNombre") || get("cliente_razonSocial") || get("cliente"),
    nif: get("clienteNIF") || get("cliente_nif"),
  };

  // --- Líneas
  const lineas: LineaMin[] = [];

  // 1) Estructura por filas con data-linea (recomendado)
  const rows = Array.from(doc.querySelectorAll<HTMLElement>("[data-linea]"));
  if (rows.length) {
    for (const row of rows) {
      const pick = (k: string) =>
        (row.querySelector<HTMLInputElement>(`[data-${k}]`)?.value ??
          row.querySelector<HTMLInputElement>(`[name="${k}"]`)?.value ??
          "").trim();

      const descripcion = pick("descripcion") || pick("concepto");
      const cantidad = toNum(pick("cantidad") || "1");
      const precioUnitario = toNum(pick("precio") || pick("precioUnitario") || "0");
      const ivaPorcentaje = toNum(pick("iva") || pick("ivaPorcentaje") || "21");

      if (descripcion) {
        lineas.push({ descripcion, cantidad, precioUnitario, ivaPorcentaje });
      }
    }
  } else {
    // 2) Estructura por arrays concepto[]/cantidad[]/precio[]/iva[]
    const conceptos = doc.querySelectorAll<HTMLInputElement>('[name="concepto[]"]');
    const cantidades = doc.querySelectorAll<HTMLInputElement>('[name="cantidad[]"]');
    const precios = doc.querySelectorAll<HTMLInputElement>('[name="precio[]"]');
    const ivas = doc.querySelectorAll<HTMLInputElement>('[name="iva[]"]');

    for (let i = 0; i < conceptos.length; i++) {
      const descripcion = (conceptos[i]?.value ?? "").trim();
      if (!descripcion) continue;
      const cantidad = toNum(cantidades[i]?.value ?? "1");
      const precioUnitario = toNum(precios[i]?.value ?? "0");
      const ivaPorcentaje = toNum(ivas[i]?.value ?? "21");
      lineas.push({ descripcion, cantidad, precioUnitario, ivaPorcentaje });
    }

    // 3) Último recurso: un único concepto total
    if (!lineas.length) {
      const descripcion = get("concepto") || "Servicio";
      const cantidad = toNum(get("cantidad") || "1");
      const precioUnitario = toNum(get("precio") || get("importe") || "0");
      const ivaPorcentaje = toNum(get("iva") || "21");
      if (precioUnitario > 0) {
        lineas.push({ descripcion, cantidad, precioUnitario, ivaPorcentaje });
      }
    }
  }

  // --- Totales (si vienen de inputs, úsalos; si no, calcúlalos)
  let baseImponible = toNum(get("baseImponible"));
  let importeIVA = toNum(get("importeIVA"));
  let importeTotal = toNum(get("importeTotal"));

  if (!(baseImponible && importeTotal)) {
    baseImponible = 0;
    importeIVA = 0;
    for (const l of lineas) {
      const baseLinea = l.cantidad * l.precioUnitario;
      baseImponible += baseLinea;
      importeIVA += baseLinea * (l.ivaPorcentaje / 100);
    }
    importeTotal = baseImponible + importeIVA;
  }

  return {
    serie,
    numero,
    fecha,
    emisor,
    receptor,
    lineas,
    totales: {
      baseImponible: +baseImponible.toFixed(2),
      importeIVA: +importeIVA.toFixed(2),
      importeTotal: +importeTotal.toFixed(2),
    },
  };
}
