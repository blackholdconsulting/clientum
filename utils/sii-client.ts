export async function signXMLAndSendToSII(xml: string) {
  const res = await fetch('/api/sii/enviar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: xml,
  });
  if (!res.ok) throw new Error('Error al enviar al SII');
  const data = await res.json();
  return { enlace_pdf: data.enlace_pdf || null };
}
