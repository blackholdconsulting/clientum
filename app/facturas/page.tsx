// app/facturas/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { buildFacturaeXML, FacturaeData } from "../../lib/facturae";

export default function FacturasPage() {
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [emisor, setEmisor] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    cp: "",
    ciudad: "",
  });
  const [receptor, setReceptor] = useState({
    nombre: "",
    cif: "",
    direccion: "",
    cp: "",
    ciudad: "",
  });
  const [lineas, setLineas] = useState<{ descripcion: string; cantidad: number; precio: number }[]>([]);
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);

  const enviarVerifactu = async () => {
    const data: FacturaeData = {
      serie,
      numero,
      fecha,
      vencimiento,
      emisor: {
        nombre: emisor.nombre,
        nif: emisor.nif,
        direccion: emisor.direccion,
        cp: emisor.cp,
        ciudad: emisor.ciudad,
      },
      receptor: {
        nombre: receptor.nombre,
        cif: receptor.cif,
        direccion: receptor.direccion,
        cp: receptor.cp,
        ciudad: receptor.ciudad,
      },
      lineas,
      iva,
      irpf,
    };

    const xml = buildFacturaeXML(data);

    try {
      const resp = await axios.post<{ pdfUrl: string }>(
        "https://api.verifactu.com/v1/invoices/upload",
        { xml },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERIFACTU_KEY}`,
          },
        }
      );
      window.open(resp.data.pdfUrl, "_blank");
    } catch (error: any) {
      console.error("Error enviando a Verifactu:", error);
      alert("No se pudo generar la factura en Verifactu.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Crear Factura</h1>

      {/* Formulario básico */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Serie"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          placeholder="Fecha emisión"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          placeholder="Fecha vencimiento"
          value={vencimiento}
          onChange={(e) => setVencimiento(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Datos emisor y receptor */}
      <div className="grid grid-cols-2 gap-4">
        <fieldset className="space-y-2">
          <legend className="font-medium">Emisor</legend>
          <input
            type="text"
            placeholder="Nombre"
            value={emisor.nombre}
            onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="NIF"
            value={emisor.nif}
            onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={emisor.direccion}
            onChange={(e) => setEmisor({ ...emisor, direccion: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="CP"
              value={emisor.cp}
              onChange={(e) => setEmisor({ ...emisor, cp: e.target.value })}
              className="border px-3 py-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={emisor.ciudad}
              onChange={(e) => setEmisor({ ...emisor, ciudad: e.target.value })}
              className="border px-3 py-2 rounded w-1/2"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="font-medium">Receptor</legend>
          <input
            type="text"
            placeholder="Nombre"
            value={receptor.nombre}
            onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="CIF"
            value={receptor.cif}
            onChange={(e) => setReceptor({ ...receptor, cif: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={receptor.direccion}
            onChange={(e) => setReceptor({ ...receptor, direccion: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="CP"
              value={receptor.cp}
              onChange={(e) => setReceptor({ ...receptor, cp: e.target.value })}
              className="border px-3 py-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={receptor.ciudad}
              onChange={(e) => setReceptor({ ...receptor, ciudad: e.target.value })}
              className="border px-3 py-2 rounded w-1/2"
            />
          </div>
        </fieldset>
      </div>

      {/* Botón de envío */}
      <button
        onClick={enviarVerifactu}
        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Enviar a Verifactu
      </button>
    </main>
);
}
