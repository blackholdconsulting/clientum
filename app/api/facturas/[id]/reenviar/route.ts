import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendToSii } from "@/lib/sii/sendToSII";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { success: false, message: "Faltan variables de entorno" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    // 1️⃣ Obtener factura
    const { data: factura, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !factura) {
      return NextResponse.json(
        { success: false, message: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const userId = factura.user_id;

    // 2️⃣ Obtener certificado del usuario
    const { data: certData, error: certError } = await supabase
      .from("certificados")
      .select("certificado, password")
      .eq("user_id", userId)
      .single();

    if (certError || !certData) {
      return NextResponse.json(
        { success: false, message: "No se encontró certificado del usuario" },
        { status: 404 }
      );
    }

    const certificadoBuffer = certData.certificado;
    const password = certData.password;

    // 3️⃣ Reintentar envío
    const result = await sendToSii(
      factura.json_factura,
      certificadoBuffer,
      password
    );

    // 4️⃣ Actualizar estado en la tabla facturas
    const { error: updateError } = await supabase
      .from("facturas")
      .update({
        estado: result.estado,
        csv: result.csv || null,
      })
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
