import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ✅ POST - Crear nueva factura
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { serie, numero, cliente_id, lineas, iva } = body;

    if (!serie || !numero || !cliente_id || !lineas || lineas.length === 0) {
      return NextResponse.json(
        { success: false, message: "Faltan datos obligatorios" },
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

    // Crear JSON Facturae
    const jsonFactura = {
      serie,
      numero,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        email: cliente.email,
      },
      lineas: lineas.map((l: any) => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio: l.precio,
        total: l.cantidad * l.precio,
      })),
      iva,
      subtotal,
      iva_total: ivaTotal,
      total,
      fecha_emision: new Date().toISOString(),
    };

    // Guardar en Supabase
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
        json_factura: jsonFactura,
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
