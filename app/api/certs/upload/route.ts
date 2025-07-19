// app/api/certs/upload/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import forge from "node-forge";

export async function POST(req: Request) {
  // Inicializa el cliente de Supabase para Route Handlers
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
    }

    // Lee el contenido del fichero
    const arrayBuffer = await file.arrayBuffer();
    const der = new Uint8Array(arrayBuffer);

    // Aquí iría tu lógica con forge, p.ej. parsear el certificado:
    const asn1 = forge.asn1.fromDer(forge.util.createBuffer(der));
    const cert = forge.pki.certificateFromAsn1(asn1);

    // Guarda el certificado en Supabase (ajusta tu tabla y columnas)
    const { error } = await supabase
      .from("certs")
      .insert([
        {
          serial: cert.serialNumber,
          issuer: cert.issuer.attributes.map((a) => `${a.name}=${a.value}`).join(","),
          pem: forge.pki.certificateToPem(cert),
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

