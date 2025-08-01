"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import FacturaPDF from "@/components/FacturaPDF";

export default function ExportarPDFButton({ factura }: { factura: any }) {
  return (
    <PDFDownloadLink
      document={<FacturaPDF factura={factura} />}
      fileName={`factura-${factura.numero}.pdf`}
    >
      {({ loading }) =>
        loading ? (
          <button className="bg-gray-400 px-4 py-2 rounded">Generando...</button>
        ) : (
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Exportar PDF
          </button>
        )
      }
    </PDFDownloadLink>
  );
}
