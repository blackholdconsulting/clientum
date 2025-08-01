import PDFDocument from "pdfkit";

export async function generatePDF(factura: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Título
      doc.fontSize(20).text("Factura", { align: "center" }).moveDown();

      // Datos de la factura
      doc.fontSize(12).text(`Número: ${factura.numero || "-"}`);
      doc.text(`Fecha emisión: ${factura.fecha_emisor || "-"}`);
      doc.text(`Fecha vencimiento: ${factura.fecha_vencim || "-"}`);
      doc.text(`Cliente ID: ${factura.cliente_id || "-"}`);
      doc.text(`Emisor: ${factura.emisor || "-"}`);
      doc.text(`Receptor: ${factura.receptor || "-"}`).moveDown();

      // Conceptos y totales
      doc.text(`Concepto: ${factura.concepto || "-"}`);
      doc.text(`Base imponible: ${factura.base_imponib || 0} €`);
      doc.text(`IVA: ${factura.iva_percent || 0}% (${factura.iva_total || 0} €)`);
      doc.text(`Total: ${factura.total || 0} €`).moveDown();

      doc.text(`Estado: ${factura.estado || "-"}`);
      doc.text(`Servicio: ${factura.servicio || "-"}`);
      doc.text(`Vía: ${factura.via || "-"}`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
