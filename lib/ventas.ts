// /lib/ventas.ts
import { supabase } from "./supabaseClient";

/**
 * Genera un código único FAC25-XXXX
 */
export function generarCodigoFactura(): string {
  // XXXX: 4 dígitos aleatorios alfanuméricos
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FAC25-${random}`;
}

/**
 * Inserta una entrada en la tabla ventas.
 */
export async function registraVenta({
  fecha,
  cliente_id,
  numero_factura,
  base,
  iva,
}: {
  fecha: string;
  cliente_id: string;
  numero_factura: string;
  base: number;
  iva: number;
}) {
  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();
  if (sessErr || !session?.user.id) throw new Error("No session activa");

  const { error } = await supabase
    .from("ventas")
    .insert({
      user_id: session.user.id,
      fecha,
      cliente_id,
      numero_factura,
      base,
      iva,
    });

  if (error) throw error;
}
