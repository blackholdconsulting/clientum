import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generatePDF } from "@/lib/pdfGenerator";

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const id = parts[parts.indexOf("facturas") + 1];

  try {
    const { data: factura, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !factura) {
      return NextResponse.json({ success: false, message: "Factura no encontrada" }, { status: 404 });
    }

    const pdfBuffer = await generatePDF(factura);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=factura-${factura.numero}.pdf`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error generando PDF" },
      { status: 500 }
    );
  }
}
