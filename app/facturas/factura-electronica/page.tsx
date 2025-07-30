import { generateFacturaeXML as buildFacturaeXML } from "../../lib/facturae";

export default function FacturasPage() {
  const crearFactura = () => {
    const xml = buildFacturaeXML({
      issuerName: "Clientum S.L.",
      issuerNIF: "B12345678",
      receiverName: "Cliente Ejemplo",
      receiverNIF: "A87654321",
      invoiceNumber: "FAC-2025-001",
      invoiceDate: new Date().toISOString().slice(0, 10),
      concept: "Servicio de consultoría",
      baseAmount: 1000,
      vat: 21,
      totalAmount: 1210,
    });

    console.log("Facturae XML:", xml);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Listado de Facturas</h1>
      <button
        onClick={crearFactura}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Generar Factura XML
      </button>
    </div>
  );
}
