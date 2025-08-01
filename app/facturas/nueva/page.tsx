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
      estado: "borrador",
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
    if (data.success) {
      setMensaje("✅ Factura generada correctamente");
    } else {
      setMensaje("❌ Error guardando factura: " + data.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white shadow-md rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-4">Crear Factura</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Serie"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border p-3 rounded-lg"
        />
        <input
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border p-3 rounded-lg"
        />
        <input
          type="date"
          value={fechaEmisor}
          onChange={(e) => setFechaEmisor(e.target.value)}
          className="border p-3 rounded-lg"
        />
        <input
          type="date"
          value={fechaVencimiento}
          onChange={(e) => setFechaVencimiento(e.target.value)}
          className="border p-3 rounded-lg"
        />
        <input
          placeholder="Emisor"
          value={emisor}
          onChange={(e) => setEmisor(e.target.value)}
          className="border p-3 rounded-lg col-span-2"
        />
        <input
          placeholder="Receptor (ID del cliente)"
          value={receptor}
          onChange={(e) => setReceptor(e.target.value)}
          className="border p-3 rounded-lg col-span-2"
        />
      </div>

      <textarea
        placeholder="Concepto"
        value={concepto}
        onChange={(e) => setConcepto(e.target.value)}
        className="border p-3 rounded-lg w-full mb-4"
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input
          type="number"
          placeholder="Unidades"
          value={unidades}
          onChange={(e) => setUnidades(Number(e.target.value))}
          className="border p-3 rounded-lg"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
          className="border p-3 rounded-lg"
        />
        <input
          type="number"
          placeholder="IVA %"
          value={iva}
          onChange={(e) => setIva(Number(e.target.value))}
          className="border p-3 rounded-lg"
        />
      </div>

      <button
        onClick={handleGenerarFactura}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
      >
        Guardar Factura
      </button>

      {mensaje && (
        <div className="mt-4 text-center text-lg font-semibold text-gray-700">
          {mensaje}
        </div>
      )}
    </div>
  );
}

