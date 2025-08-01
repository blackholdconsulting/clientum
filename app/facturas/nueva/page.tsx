"use client";

import { useState } from "react";

export default function NuevaFacturaPage() {
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fechaEmisor, setFechaEmisor] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [emisor, setEmisor] = useState("");
  const [receptor, setReceptor] = useState("");
  const [concepto, setConcepto] = useState("");
  const [unidades, setUnidades] = useState(1);
  const [precio, setPrecio] = useState(0);
  const [iva, setIva] = useState(21);
  const [mensaje, setMensaje] = useState("");

  const handleGenerarFactura = async () => {
    const baseImponible = unidades * precio;
    const ivaTotal = (baseImponible * iva) / 100;
    const total = baseImponible + ivaTotal;

    const body = {
      cliente_id: receptor,
      fecha_emisor: fechaEmisor,
      fecha_vencim: fechaVencimiento,
      concepto,
      base_imponib: baseImponible,
      iva_percent: iva,
      iva_total: ivaTotal,
      total,
      servicio: "",
      base: baseImponible,
      iva,
      via: "online",
      emisor,
      receptor,
      json_factura: {
        serie,
        numero,
        emisor,
        receptor,
        concepto,
        unidades,
        precio,
        iva,
        total
      }
    };

    const response = await fetch("/api/facturas/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    setMensaje(data.success ? "✅ Factura generada correctamente" : "❌ Error: " + data.message);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white shadow-md rounded-xl p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-700">Crear Factura</h1>
        <div className="space-x-2">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600">
            Exportar PDF
          </button>
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600">
            Enviar Verifactu
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700">
            Facturae
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Serie"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <input
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="date"
          value={fechaEmisor}
          onChange={(e) => setFechaEmisor(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="date"
          value={fechaVencimiento}
          onChange={(e) => setFechaVencimiento(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Emisor"
          value={emisor}
          onChange={(e) => setEmisor(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <input
          placeholder="Receptor (ID del cliente)"
          value={receptor}
          onChange={(e) => setReceptor(e.target.value)}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <textarea
        placeholder="Concepto"
        value={concepto}
        onChange={(e) => setConcepto(e.target.value)}
        className="border p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-indigo-400"
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="number"
          placeholder="Unidades"
          value={unidades}
          onChange={(e) => setUnidades(Number(e.target.value))}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="number"
          placeholder="IVA %"
          value={iva}
          onChange={(e) => setIva(Number(e.target.value))}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <button
        onClick={handleGenerarFactura}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-700 transition-all"
      >
        💾 Guardar Factura
      </button>

      {mensaje && (
        <div className="mt-4 text-center text-lg font-semibold text-gray-700">
          {mensaje}
        </div>
      )}
    </div>
  );
}
