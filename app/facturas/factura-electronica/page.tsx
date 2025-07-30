"use client";

export default function FacturasElectronicasPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas Electrónicas</h1>
      <p className="mb-4">
        Aquí verás el listado de facturas electrónicas enviadas a la AEAT.
      </p>
      <a
        href="/facturas/factura-electronica/nueva"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Crear nueva factura electrónica
      </a>
    </div>
  );
}
