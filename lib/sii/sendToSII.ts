export async function sendToSii(facturaId: string, userId: string) {
  return { status: "ok", facturaId, userId };
}
