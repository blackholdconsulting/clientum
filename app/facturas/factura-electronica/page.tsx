"use client";
<<<<<<< HEAD
=======
import { useState } from "react";
>>>>>>> b54d036 (feat: integración AEAT con firma y envío automático)

export default function FacturasElectronicasPage() {
  const [estadoEnvio, setEstadoEnvio] = useState("");

  const enviarFactura = async () => {
    try {
      setEstadoEnvio("Enviando...");
      const res = await fetch("/api/factura-electronica", {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        // ⚠️ Aquí debes pasar el XML generado
        body: "<Facturae>...</Facturae>",
      });

      const data = await res.json();
      if (data.success) {
        setEstadoEnvio("Factura enviada correctamente ✅");
      } else {
        setEstadoEnvio("Error: " + data.error);
      }
    } catch (err) {
      setEstadoEnvio("Error de conexión con AEAT ❌");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas Electrónicas</h1>
      <p className="mb-4">
        Aquí verás el listado de facturas electrónicas enviadas a la AEAT.
      </p>
<<<<<<< HEAD
      <a
        href="/facturas/factura-electronica/nueva"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Crear nueva factura electrónica
      </a>
=======
      <div className="flex gap-4">
        <a
          href="/facturas/factura-electronica/nueva"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Crear nueva factura electrónica
        </a>
        <button
          onClick={enviarFactura}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Enviar última factura a AEAT
        </button>
      </div>
      {estadoEnvio && <p className="mt-2 text-sm">{estadoEnvio}</p>}
>>>>>>> b54d036 (feat: integración AEAT con firma y envío automático)
    </div>
  );
}
