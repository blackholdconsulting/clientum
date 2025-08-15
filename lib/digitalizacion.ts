import crypto from 'crypto';

export type ScanDoc = {
  id: string;
  filename: string;
  mime: string;
  size_bytes: number;
  sha256: string;      // hex
  storage_path: string;
  meta?: Record<string, unknown>;
};

export function sha256Hex(buf: Buffer | Uint8Array | ArrayBuffer): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf as ArrayBuffer);
  return crypto.createHash('sha256').update(b).digest('hex');
}

/**
 * Construye un manifiesto XML de lote para FZ01.
 * Incluye huella por documento, tamaño y ruta de almacenamiento.
 * Lo firmaremos con XAdES usando el microservicio existente.
 */
export function buildBatchManifestXML(args: {
  batchId: string;
  userId: string;
  docs: ScanDoc[];
  metadata?: Record<string, unknown>;
}): { xml: string; hashChainHex: string } {
  // Encadenado: sha256( doc1.sha256 + doc2.sha256 + ... ) en binario
  const chain = crypto.createHash('sha256');
  for (const d of args.docs) {
    chain.update(Buffer.from(d.sha256, 'hex'));
  }
  const hashChainHex = chain.digest('hex');

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const now = new Date().toISOString();

  const docsXml = args.docs
    .map(
      (d, i) => `
      <Document index="${i + 1}">
        <FileName>${esc(d.filename)}</FileName>
        <MimeType>${esc(d.mime)}</MimeType>
        <Size>${d.size_bytes}</Size>
        <Sha256>${d.sha256}</Sha256>
        <StoragePath>${esc(d.storage_path)}</StoragePath>
      </Document>`
    )
    .join('\n');

  const metadataXml =
    args.metadata && Object.keys(args.metadata).length
      ? `<Metadata>${esc(JSON.stringify(args.metadata))}</Metadata>`
      : '';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DigitalizationBatch xmlns="urn:clientum:fz01:manifest" version="1.0">
  <BatchId>${esc(args.batchId)}</BatchId>
  <OwnerUser>${esc(args.userId)}</OwnerUser>
  <CreatedAt>${now}</CreatedAt>
  <HashChain algorithm="SHA-256">${hashChainHex}</HashChain>
  ${metadataXml}
  <Documents>
    ${docsXml}
  </Documents>
</DigitalizationBatch>`;

  return { xml, hashChainHex };
}
