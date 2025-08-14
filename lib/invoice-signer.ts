// --- ADD: helpers seguros para reutilizar desde el API ---

/**
 * Firma un XML Facturae llamando al proxy /api/sign/xml con X-API-Key y Content-Type: application/xml.
 * Devuelve los bytes del documento XAdES (Uint8Array).
 */
export async function signFacturaeXml(xml: string): Promise<Uint8Array> {
  const apiKey = process.env.SIGNER_API_KEY!;
  if (!apiKey) throw new Error('Falta SIGNER_API_KEY en variables de entorno.');

  // Construimos URL absoluta del proxy; usa NEXT_PUBLIC_APP_URL en prod si la tienes
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const res = await fetch(new URL('/api/sign/xml', base), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'X-API-Key': apiKey,
    },
    body: xml,
    // Importante: no reenviar cookies del usuario al microservicio
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Autenticación inválida con el servicio de firma (401/403).');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error del servicio de firma (${res.status}): ${text || 'sin cuerpo'}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Placeholder: si necesitas exponer el builder tipado hacia fuera. Ajusta el tipo `FacturaePayload` según tu implementación real.
 * Mantén la firma existente para no romper importadores actuales.
 */
export async function buildFacturaeXml(payload: any): Promise<string> {
  // Si ya tienes una función con este nombre, elimina esta y usa la tuya.
  // Aquí solo dejamos la firma para dejar claro el contrato esperado por /app/api/facturas/route.ts.
  return (globalThis as any).__existing_buildFacturaeXml(payload);
}
