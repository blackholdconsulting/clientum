"use client";

import { useState } from "react";
import { sendFacturaToAEAT } from "@/lib/sendToAEAT";

export default function NuevaFacturaElectronica() {
  const [emisor, setEmisor] = useState({ nombre: "", nif: "" });
  const [receptor, setReceptor] = useState({ nombre: "", nif: "" });
  const [concepto, setConcepto] = useState("");
  const [base, setBase] = useState(0);
  const [iva, setIva] = useState(21);
  const [estado, setEstado] = useState("");

  const enviar = async () => {
    try {
      setEstado("Enviando...");
      const total = base + (base * iva) / 100;

      await sendFacturaToAEAT({
        issuerName: emisor.nombre,
        issuerNIF: emisor.nif,
        receiverName: receptor.nombre,
        receiverNIF: receptor.nif,
        invoiceNumber: "FAC-001",
        invoiceDate: new Date().toISOString().slice(0, 10),
        concept: concepto,
        baseAmount: base,
        vat: iva,
        totalAmount: total,
      });

      setEstado("Factura enviada correctamente ✅");
    } catch (error) {
      console.error(error);
      setEstado("Error al enviar la factura ❌");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nueva Factura Electrónica</h1>

      <div className="space-y-4">
        <input
          placeholder="Nombre Emisor"
          className="border p-2 rounded w-full"
          value={emisor.nombre}
          onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
        />
        <input
          placeholder="NIF Emisor"
          className="border p-2 rounded w-full"
          value={emisor.nif}
          onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
        />
        <input
          placeholder="Nombre Receptor"
          className="border p-2 rounded w-full"
          value={receptor.nombre}
          onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
        />
        <input
          placeholder="NIF Receptor"
          className="border p-2 rounded w-full"
          value={receptor.nif}
          onChange={(e) => setReceptor({ ...receptor, nif: e.target.value })}
        />
        <input
          placeholder="Concepto"
          className="border p-2 rounded w-full"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />
        <input
          type="number"
          placeholder="Base imponible"
          className="border p-2 rounded w-full"
          value={base}
          onChange={(e) => setBase(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="IVA (%)"
          className="border p-2 rounded w-full"
          value={iva}
          onChange={(e) => setIva(Number(e.target.value))}
        />
        <button
          onClick={enviar}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Enviar a AEAT
        </button>
        {estado && <p className="mt-4">{estado}</p>}
      </div>
    </div>
  );
}
