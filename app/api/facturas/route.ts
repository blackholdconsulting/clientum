import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { serie, numero, cliente_id, lineas, iva, tipo_factura, metodo_pago, remitente } = body;

    if (!serie || !numero || !cliente_id || !lineas || lineas.length === 0 || !remitente?.nombre) {
      return NextResponse.json(
        { success: false, message: "Faltan datos obligatorios para la factura" },
        { status: 400 }
      );
    }

    // Obtener datos del cliente
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", cliente_id)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        { success: false, message: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Calcular totales
    const subtotal = lineas.reduce(
      (sum: number, l: any) => sum + l.cantidad * l.precio,
      0
    );
    const ivaTotal = (subtotal * iva) / 100;
    const total = subtotal + ivaTotal;

    // JSON compatible con Facturae
    const jsonFacturae = {
      version: "3.2.2",
      invoiceHeader: {
        invoiceNumber: numero,
        invoiceSeriesCode: serie,
        invoiceDocumentType: tipo_factura || "FACTURA",
        paymentMeans: metodo_pago,
        invoiceCurrencyCode: "EUR",
      },
      sellerParty: {
        taxIdentification: {
          personTypeCode: "J",
          residenceTypeCode: "R",
          taxIdentificationNumber: remitente.nif,
        },
        legalEntity: {
          corporateName: remitente.nombre,
          addressInSpain: {
            address: remitente.direccion,
            postCode: remitente.cp,
            town: remitente.ciudad,
            province: remitente.provincia,
            countryCode: remitente.pais || "ESP",
          },
          contactDetails: {
            telephone: remitente.telefono,
            electronicMail: remitente.email,
            webAddress: remitente.web,
          },
        },
      },
      buyerParty: {
        taxIdentification: {
          personTypeCode: "J",
          residenceTypeCode: "R",
          taxIdentificationNumber: cliente.nif || "N/A",
        },
        legalEntity: {
          corporateName: cliente.nombre,
          addressInSpain: {
            address: cliente.direccion || "",
            postCode: cliente.cp || "",
            town: cliente.ciudad || "",
            province: cliente.provincia || "",
            countryCode: cliente.pais || "ESP",
          },
          contactDetails: {
            telephone: cliente.telefono || "",
            electronicMail: cliente.email || "",
          },
        },
      },
      items: lineas.map((l: any) => ({
        description: l.descripcion,
        quantity: l.cantidad,
        unitPriceWithoutTax: l.precio,
        totalCost: l.cantidad * l.precio,
      })),
      taxesOutputs: [
        {
          taxTypeCode: "01",
          taxRate: iva,
          taxableBase: subtotal,
          taxAmount: ivaTotal,
        },
      ],
      invoiceTotals: {
        totalGrossAmount: subtotal,
        totalTaxOutputs: ivaTotal,
        totalInvoiceAmount: total,
      },
      paymentDetails: {
        paymentMeans: metodo_pago,
      },
    };

    // Guardar en la tabla
    const { data, error } = await supabase.from("facturas").insert([
      {
        cliente_id,
        numero,
        concepto: `Factura ${serie}-${numero}`,
        base_imponib: subtotal,
        iva_percent: iva,
        iva_total: ivaTotal,
        total,
        estado: "borrador",
        tipo_factura,
        metodo_pago: metodo_pago,
        remitente: remitente,
        json_factura: jsonFacturae,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Factura creada correctamente",
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error interno" },
      { status: 500 }
    );
  }
}


