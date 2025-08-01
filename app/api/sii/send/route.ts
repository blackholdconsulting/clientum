import { NextResponse } from "next/server";
import { sendToSii } from "@/lib/sii/sendToSII";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { success: false, error: "Faltan variables de entorno de Supabase" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const body = await request.json();
  const facturaData = body.facturaData;
  const userId = body.userId;

  try {
    // 1️⃣ Obtener certificado automáticamente
    const { data: certData, error: certError } = await supabase
      .from("certificados")
      .select("certificado, password")
      .eq("user_id", userId)
      .single();

    if (certError || !certData) {
      return NextResponse.json(
        { success: false, error: "No se encontró certificado para este usuario" },
        { status: 404 }
      );
    }

    const certificadoBuffer = certData.certificado;
    const password = certData.password;

    // 2️⃣ Enviar factura a AEAT
    const result = await sendToSii(facturaData, certificadoBuffer, password);

    // 3️⃣ Guardar en la tabla facturas
    await supabase.from("facturas").insert([
      {
        numero: facturaData.numeroFactura,
        fecha: new Date(),
        cliente: facturaData.cliente.nombre,
        estado: result.estado,
        csv: result.csv || null,
        user_id: userId,
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

