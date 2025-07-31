// /lib/ventas.ts
import { supabase } from "./supabaseClient";

/**
 * Genera un código único FAC25-XXXX
 */
export function generarCodigoFactura(): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FAC25-${random}`;
}

/**
 * Inserta en la tabla “ventas” una nueva fila ligada al usuario.
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
  // Obtiene sesión
  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();
  if (sessErr || !session?.user.id) {
    throw new Error("Usuario no autenticado");
  }

  // Inserta
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

  if (error) {
    throw error;
  }
}
