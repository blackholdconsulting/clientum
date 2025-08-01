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
    if (data.success) {
      setMensaje("Factura generada correctamente");
    } else {
      setMensaje("Error guardando factura: " + data.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Crear Factura</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Serie"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border p-2"
        />
        <input
          type="date"
          value={fechaEmisor}
          onChange={(e) => setFechaEmisor(e.target.value)}
          className="border p-2"
        />
        <input
          type="date"
          value={fechaVencimiento}
          onChange={(e) => setFechaVencimiento(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Emisor"
          value={emisor}
          onChange={(e) => setEmisor(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Receptor (ID del cliente)"
          value={receptor}
          onChange={(e) => setReceptor(e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Concepto"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          className="border p-2 col-span-2"
        />
        <input
          type="number"
          placeholder="Unidades"
          value={unidades}
          onChange={(e) => setUnidades(Number(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="IVA %"
          value={iva}
          onChange={(e) => setIva(Number(e.target.value))}
          className="border p-2"
        />
      </div>

      <button
        onClick={handleGenerarFactura}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Generar Factura
      </button>

      {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
    </div>
  );
}

