export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serie = url.searchParams.get("serie") ?? "";
  const numero = url.searchParams.get("numero") ?? "";

  // PDF mínimo (Hello PDF) para salir del paso:
  const pdf = `%PDF-1.4
1 0 obj<<>>endobj
2 0 obj<< /Length 44 >>stream
BT /F1 24 Tf 100 700 Td (Factura ${serie}${numero}) Tj ET
endstream endobj
3 0 obj<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>endobj
4 0 obj<< /Type /Page /Parent 5 0 R /Resources<< /Font<< /F1 3 0 R >> >> /MediaBox [0 0 595 842] /Contents 2 0 R >>endobj
5 0 obj<< /Type /Pages /Kids [4 0 R] /Count 1 >>endobj
6 0 obj<< /Type /Catalog /Pages 5 0 R >>endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000047 00000 n 
0000000143 00000 n 
0000000234 00000 n 
0000000361 00000 n 
0000000426 00000 n 
trailer<< /Size 7 /Root 6 0 R >>
startxref
492
%%EOF`;

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="factura-${serie}${numero}.pdf"`,
    },
  });
}
