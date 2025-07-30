import { NextResponse } from "next/server";
import { sendFacturaToAEAT } from "@/lib/sendToAEAT";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await sendFacturaToAEAT(data);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
