import { NextResponse } from "next/server";
import { generateFacturaeXML } from "@/utils/facturae";

export async function GET() {
  const xml = generateFacturaeXML({
    numeroFactura: "F2025-001",
    fecha: new Date(),
    emisor: {
      nombre: "Mi Empresa SL",
      nif: "B12345678",
      direccion: "Calle Mayor 1",
      ciudad: "Madrid",
      cp: "28001",
      provincia: "Madrid",
      pais: "ESP",
    },
    cliente: {
      nombre: "Juan Pérez",
      nif: "12345678A",
      direccion: "Av. Libertad 5",
      ciudad: "Madrid",
      cp: "28002",
      provincia: "Madrid",
      pais: "ESP",
    },
    lineas: [
      { descripcion: "Servicio de consultoría", cantidad: 1, precioUnitario: 100, iva: 21 },
    ],
  });

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
