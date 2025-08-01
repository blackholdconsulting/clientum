import { NextResponse } from "next/server";
import { sendToSii } from "@/lib/sii/sendToSII";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // Inicializar supabase solo cuando hay petición
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const body = await request.json();
  const facturaData = body.facturaData;
  const userId = body.userId || "default_user_id";
  const certificadoBase64 = body.certificado || null;
  const password = body.password || null;

  const certificadoBuffer = certificadoBase64
    ? Buffer.from(certificadoBase64, "base64")
    : undefined;

  try {
    const result = await sendToSii(facturaData, certificadoBuffer, password);

    await supabase.from("facturas").insert([
      {
        numero: facturaData.numeroFactura,
        fecha: new Date(),
        cliente: facturaData.cliente.nombre,
        estado: result.estado,
        user_id: userId,
        csv: result.csv || null,
      },
    ]);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
