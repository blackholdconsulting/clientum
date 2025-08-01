// app/api/sii/send/route.ts
import { NextResponse } from "next/server";
import { sendToSii } from "@/lib/sii/sendToSII";
import { createServerClient } from "@lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();

  const body = await request.json();
  const facturaData = body.facturaData; // Datos completos de la factura
  const userId = body.userId || "default_user_id";
  const certificadoBase64 = body.certificado || null;
  const password = body.password || null;

  // Convertir certificado de base64 a Buffer si existe
  const certificadoBuffer = certificadoBase64
    ? Buffer.from(certificadoBase64, "base64")
    : undefined;

  try {
    // Enviar factura a AEAT
    const result = await sendToSii(facturaData, certificadoBuffer, password);

    // Guardar en la tabla facturas
    await supabase.from("facturas").insert([
      {
        numero: facturaData.numeroFactura,
        fecha: new Date(),
        cliente: facturaData.cliente.nombre,
        estado: result.estado,
        user_id: userId,
        csv: result.csv || null
      }
    ]);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
