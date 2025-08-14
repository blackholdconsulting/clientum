/* ============================================================================
 * lib/invoice-signer.ts
 * Helpers para:
 *  - Volcar emisor desde /api/profile
 *  - Recoger la factura del formulario
 *  - Construir XML Facturae 3.2.2 (mínimo)
 *  - Enviar a /api/sign para firmar (proxy al microservicio)
 *  - Utilidades de descarga y nombres de archivo
 * ==========================================================================*/

export type EmisorMin = {
  nombre?: string;
  nif?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  cp?: string;
  email?: string;
  telefono?: string;
};

export type ReceptorMin = {
  nombre?: string;
  nif?: string;
};

export type LineaMin = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: number; // p.ej. 21
};

export type FacturaMin = {
  serie?: string;
  numero?: string;
  fecha?: string; // yyyy-mm-dd
  emisor: EmisorMin;
  receptor: ReceptorMin;
  lineas: LineaMin[];
  totales: {
    baseImponible: number;
    importeIVA: number;
    importeTotal: number;
  };
  moneda?: string; // por defecto EUR
};

/* ------------------------- Utilidades internas --------------------------- */
const fmt2 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(2);
const num = (v: string | number | null | undefined) =>
  typeof v === "number"
    ? v
    : (() => {
        const x = parseFloat(String(v ?? "0").replace(/\./g, "").replace(",", "."));
        return Number.isFinite(x) ? x : 0;
      })();

const xmlEsc = (s?: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/* ========================= 1) Emisor desde perfil ======================== */
export async function prefillEmitterFromProfile(): Promise<Partial<EmisorMin>> {
  try {
    const r = await fetch("/api/profile", { cache: "no-store" });
    if (!r.ok) return {};
    const p = await r.json();

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

/* ==================== 2) Recoger datos del formulario ==================== */
export function collectInvoice(doc?: Document): FacturaMin {
  // Evita problemas en SSR: solo usa document en cliente
  if (!doc && typeof document !== "undefined") doc = document;
  if (!doc) {
    // fallback vacío si se llama en servidor por error
    return {
      serie: "",
      numero: "",
      fecha: new Date().toISOString().slice(0, 10),
      emisor: {},
      receptor: {},
      lineas: [],
      totales: { baseImponible: 0, importeIVA: 0, importeTotal: 0 },
      moneda: "EUR",
    };
  }

  const get = (sel: string): string => {
    const byCss = doc!.querySelector<HTMLInputElement>(sel);
    const byName = doc!.querySelector<HTMLInputElement>(`[name="${sel}"]`);
    const byId = doc!.querySelector<HTMLInputElement>(`#${sel}`);
    const byData = doc!.querySelector<HTMLInputElement>(`[data-field="${sel}"]`);
    return (byCss?.value ?? byName?.value ?? byId?.value ?? byData?.value ?? "").trim();
  };

  const serie = get("serie");
  const numero = get("numero");
  const fecha = get("fecha") || new Date().toISOString().slice(0, 10);
  const moneda = (get("moneda") || "EUR").toUpperCase();

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

  const receptor: ReceptorMin = {
    nombre: get("clienteNombre") || get("cliente_razonSocial") || get("cliente"),
    nif: get("clienteNIF") || get("cliente_nif"),
  };

  const lineas: LineaMin[] = [];
  const rows = Array.from(doc.querySelectorAll<HTMLElement>("[data-linea]"));
  if (rows.length) {
    for (const row of rows) {
      const pick = (k: string) =>
        (row.querySelector<HTMLInputElement>(`[data-${k}]`)?.value ??
          row.querySelector<HTMLInputElement>(`[name="${k}"]`)?.value ??
          "").trim();

      const descripcion = pick("descripcion") || pick("concepto");
      const cantidad = num(pick("cantidad") || "1");
      const precioUnitario = num(pick("precio") || pick("precioUnitario") || "0");
      const ivaPorcentaje = num(pick("iva") || pick("ivaPorcentaje") || "21");

      if (descripcion) lineas.push({ descripcion, cantidad, precioUnitario, ivaPorcentaje });
    }
  } else {
    const conceptos = doc.querySelectorAll<HTMLInputElement>('[name="concepto[]"]');
    const cantidades = doc.querySelectorAll<HTMLInputElement>('[name="cantidad[]"]');
    const precios = doc.querySelectorAll<HTMLInputElement>('[name="precio[]"]');
    const ivas = doc.querySelectorAll<HTMLInputElement>('[name="iva[]"]');

    for (let i = 0; i < conceptos.length; i++) {
      const descripcion = (conceptos[i]?.value ?? "").trim();
      if (!descripcion) continue;
      const cantidad = num(cantidades[i]?.value ?? "1");
      const precioUnitario = num(precios[i]?.value ?? "0");
      const ivaPorcentaje = num(ivas[i]?.value ?? "21");
      lineas.push({ descripcion, cantidad, precioUnitario, ivaPorcentaje });
    }

    if (!lineas.length) {
      const descripcion = get("concepto") || "Servicio";
      const cantidad = num(get("cantidad") || "1");
      const precioUnitario = num(get("precio") || get("importe") || "0");
      const ivaPorcentaje = num(get("iva") || "21");
      if (precioUnitario > 0) {
        lineas.push({ descripcion, cantidad, precioUnitario, ivaPorcentaje });
      }
    }
  }

  // Totales: usa si existen, si no calcula
  let baseImponible = num(get("baseImponible"));
  let importeIVA = num(get("importeIVA"));
  let importeTotal = num(get("importeTotal"));

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
    moneda,
  };
}

/* ====================== 3) Construir XML Facturae ======================== */
/**
 * Construye un XML de Facturae 3.2.2 "mínimo" con un único impuesto general (IVA).
 * Si tus tipos impositivos difieren por línea, se añade una entrada por línea.
 * Este XML es suficiente para pruebas de firma y visualización básica.
 */
export function buildFacturaeXML(f: FacturaMin): string {
  const moneda = (f.moneda || "EUR").toUpperCase();
  const serie = f.serie || "";
  const numero = f.numero || new Date().getTime().toString();
  const issueDate = (f.fecha || new Date().toISOString().slice(0, 10)).substring(0, 10);

  // Agrupa por tipo de IVA para el bloque TaxesOutputs del total
  const ivaGroups = new Map<number, { base: number; cuota: number }>();
  for (const l of f.lineas) {
    const base = l.cantidad * l.precioUnitario;
    const cuota = base * (l.ivaPorcentaje / 100);
    const g = ivaGroups.get(l.ivaPorcentaje) || { base: 0, cuota: 0 };
    g.base += base;
    g.cuota += cuota;
    ivaGroups.set(l.ivaPorcentaje, g);
  }

  const sellerName = xmlEsc(f.emisor.nombre || "Emisor");
  const buyerName = xmlEsc(f.receptor.nombre || "Cliente");
  const sellerNif = xmlEsc(f.emisor.nif || "NIF000000");
  const buyerNif = xmlEsc(f.receptor.nif || "NIF111111");
  const sellerAddr = {
    dir: xmlEsc(f.emisor.direccion || ""),
    cp: xmlEsc(f.emisor.cp || ""),
    town: xmlEsc(f.emisor.localidad || ""),
    prov: xmlEsc(f.emisor.provincia || ""),
  };

  const ns = `xmlns:fe="http://www.facturae.es/Facturae/2012/v3.2.2/Facturae" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"`;

  const taxesOutputsXML = Array.from(ivaGroups.entries())
    .map(([rate, g]) => {
      return `
        <fe:Tax>
          <fe:TaxTypeCode>01</fe:TaxTypeCode>
          <fe:TaxRate>${fmt2(rate)}</fe:TaxRate>
          <fe:TaxableBase>
            <fe:TotalAmount>${fmt2(g.base)}</fe:TotalAmount>
          </fe:TaxableBase>
          <fe:TaxAmount>
            <fe:TotalAmount>${fmt2(g.cuota)}</fe:TotalAmount>
          </fe:TaxAmount>
        </fe:Tax>`;
    })
    .join("");

  const itemsXML = f.lineas
    .map((l, idx) => {
      const baseLinea = l.cantidad * l.precioUnitario;
      const cuotaLinea = baseLinea * (l.ivaPorcentaje / 100);
      return `
      <fe:InvoiceLine>
        <fe:ItemDescription>${xmlEsc(l.descripcion)}</fe:ItemDescription>
        <fe:Quantity>${fmt2(l.cantidad)}</fe:Quantity>
        <fe:UnitPriceWithoutTax>${fmt2(l.precioUnitario)}</fe:UnitPriceWithoutTax>
        <fe:TotalCost>${fmt2(baseLinea)}</fe:TotalCost>
        <fe:TaxesOutputs>
          <fe:Tax>
            <fe:TaxTypeCode>01</fe:TaxTypeCode>
            <fe:TaxRate>${fmt2(l.ivaPorcentaje)}</fe:TaxRate>
            <fe:TaxableBase>
              <fe:TotalAmount>${fmt2(baseLinea)}</fe:TotalAmount>
            </fe:TaxableBase>
            <fe:TaxAmount>
              <fe:TotalAmount>${fmt2(cuotaLinea)}</fe:TotalAmount>
            </fe:TaxAmount>
          </fe:Tax>
        </fe:TaxesOutputs>
        <fe:AdditionalLineItemInformation>Linea ${idx + 1}</fe:AdditionalLineItemInformation>
      </fe:InvoiceLine>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae ${ns} SchemaVersion="3.2.2">
  <fe:FileHeader>
    <fe:SchemaVersion>3.2.2</fe:SchemaVersion>
    <fe:Modality>I</fe:Modality>
    <fe:InvoiceIssuerType>EM</fe:InvoiceIssuerType>
    <fe:Batch>
      <fe:BatchIdentifier>${xmlEsc(serie)}${xmlEsc(numero)}</fe:BatchIdentifier>
      <fe:InvoicesCount>1</fe:InvoicesCount>
      <fe:TotalInvoicesAmount><fe:TotalAmount>${fmt2(f.totales.importeTotal)}</fe:TotalAmount></fe:TotalInvoicesAmount>
      <fe:TotalOutstandingAmount><fe:TotalAmount>${fmt2(f.totales.importeTotal)}</fe:TotalAmount></fe:TotalOutstandingAmount>
      <fe:TotalExecutableAmount><fe:TotalAmount>${fmt2(f.totales.importeTotal)}</fe:TotalAmount></fe:TotalExecutableAmount>
      <fe:InvoiceCurrencyCode>${xmlEsc(moneda)}</fe:InvoiceCurrencyCode>
    </fe:Batch>
  </fe:FileHeader>

  <fe:Parties>
    <fe:SellerParty>
      <fe:TaxIdentification>
        <fe:PersonTypeCode>F</fe:PersonTypeCode>
        <fe:ResidenceTypeCode>R</fe:ResidenceTypeCode>
        <fe:TaxIdentificationNumber>${sellerNif}</fe:TaxIdentificationNumber>
      </fe:TaxIdentification>
      <fe:LegalEntity>
        <fe:CorporateName>${sellerName}</fe:CorporateName>
        <fe:AddressInSpain>
          <fe:Address>${sellerAddr.dir}</fe:Address>
          <fe:PostCode>${sellerAddr.cp}</fe:PostCode>
          <fe:Town>${sellerAddr.town}</fe:Town>
          <fe:Province>${sellerAddr.prov}</fe:Province>
          <fe:CountryCode>ESP</fe:CountryCode>
        </fe:AddressInSpain>
        <fe:ContactDetails>
          <fe:ElectronicMail>${xmlEsc(f.emisor.email || "")}</fe:ElectronicMail>
          <fe:Telephone>${xmlEsc(f.emisor.telefono || "")}</fe:Telephone>
        </fe:ContactDetails>
      </fe:LegalEntity>
    </fe:SellerParty>

    <fe:BuyerParty>
      <fe:TaxIdentification>
        <fe:PersonTypeCode>F</fe:PersonTypeCode>
        <fe:ResidenceTypeCode>R</fe:ResidenceTypeCode>
        <fe:TaxIdentificationNumber>${buyerNif}</fe:TaxIdentificationNumber>
      </fe:TaxIdentification>
      <fe:LegalEntity>
        <fe:CorporateName>${buyerName}</fe:CorporateName>
        <fe:ContactDetails/>
      </fe:LegalEntity>
    </fe:BuyerParty>
  </fe:Parties>

  <fe:Invoices>
    <fe:Invoice>
      <fe:InvoiceHeader>
        <fe:InvoiceNumber>${xmlEsc(numero)}</fe:InvoiceNumber>
        <fe:InvoiceSeriesCode>${xmlEsc(serie)}</fe:InvoiceSeriesCode>
        <fe:InvoiceDocumentType>FC</fe:InvoiceDocumentType>
        <fe:InvoiceClass>OO</fe:InvoiceClass>
      </fe:InvoiceHeader>

      <fe:InvoiceIssueData>
        <fe:IssueDate>${issueDate}</fe:IssueDate>
        <fe:InvoiceCurrencyCode>${xmlEsc(moneda)}</fe:InvoiceCurrencyCode>
      </fe:InvoiceIssueData>

      <fe:TaxesOutputs>
        ${taxesOutputsXML}
      </fe:TaxesOutputs>

      <fe:Items>
        ${itemsXML}
      </fe:Items>

      <fe:InvoiceTotals>
        <fe:TotalGrossAmount>${fmt2(f.totales.baseImponible)}</fe:TotalGrossAmount>
        <fe:TotalGeneralDiscounts>0.00</fe:TotalGeneralDiscounts>
        <fe:TotalGeneralSurcharges>0.00</fe:TotalGeneralSurcharges>
        <fe:TotalGrossAmountBeforeTaxes>${fmt2(f.totales.baseImponible)}</fe:TotalGrossAmountBeforeTaxes>
        <fe:TotalTaxOutputs>${fmt2(f.totales.importeIVA)}</fe:TotalTaxOutputs>
        <fe:TotalTaxesWithheld>0.00</fe:TotalTaxesWithheld>
        <fe:InvoiceTotal>${fmt2(f.totales.importeTotal)}</fe:InvoiceTotal>
        <fe:TotalOutstandingAmount>${fmt2(f.totales.importeTotal)}</fe:TotalOutstandingAmount>
        <fe:TotalExecutableAmount>${fmt2(f.totales.importeTotal)}</fe:TotalExecutableAmount>
      </fe:InvoiceTotals>
    </fe:Invoice>
  </fe:Invoices>
</fe:Facturae>`;

  return xml.trim();
}

/* =================== 4) Firmar XML vía /api/sign (proxy) ================= */
export async function signFacturaeXML(xml: string): Promise<Blob> {
  const r = await fetch("/api/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ xml }),
  });
  if (!r.ok) {
    let msg = `Error al firmar: ${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      if (j?.error) msg += ` - ${j.error}`;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  // El microservicio devuelve el binario de la firma o el XML firmado
  return r.blob();
}

/* ======================== 5) Descarga y nombres ========================== */
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

export function xmlFileName(f?: Partial<FacturaMin>) {
  const n = (f?.numero || "factura").toString().replace(/\s+/g, "_");
  const s = (f?.serie || "").toString().replace(/\s+/g, "_");
  return s ? `${s}-${n}.xml` : `${n}.xml`;
}

export function pdfFileName(f?: Partial<FacturaMin>) {
  const n = (f?.numero || "factura").toString().replace(/\s+/g, "_");
  const s = (f?.serie || "").toString().replace(/\s+/g, "_");
  return s ? `${s}-${n}.pdf` : `${n}.pdf`;
}
