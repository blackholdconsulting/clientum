import { NextResponse } from "next/server";
import { generateFacturaeXML } from "@/utils/facturae";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const xml = generateFacturaeXML(body);

    return NextResponse.json({
      success: true,
      message: "Facturae generada correctamente",
      xml,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
