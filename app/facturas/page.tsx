// app/facturas/page.tsx
"use client";

import { useState } from "react";
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
  const [lineasRaw, setLineasRaw] = useState<{ descripcion: string; cantidad: number; precio: number }[]>([]);
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);

  const enviarVerifactu = async () => {
    // Convertir lineasRaw al formato que espera FacturaeData
    const lineas = lineasRaw.map((l) => ({
      descripcion: l.descripcion,
      unidades: l.cantidad,
      precioUnitario: l.precio,
    }));

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

      {/* Encabezado: serie, número, fechas */}
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

      {/* Datos del emisor y receptor */}
      <div className="grid grid-cols-2 gap-6">
        <fieldset className="space-y-2">
          <legend className="font-medium">Emisor</legend>
          {["nombre", "nif", "direccion"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(emisor as any)[field]}
              onChange={(e) =>
                setEmisor({ ...emisor, [field]: e.target.value })
              }
              className="border px-3 py-2 rounded w-full"
            />
          ))}
          <div className="flex gap-2">
            {["cp", "ciudad"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.toUpperCase()}
                value={(emisor as any)[field]}
                onChange={(e) =>
                  setEmisor({ ...emisor, [field]: e.target.value })
                }
                className="border px-3 py-2 rounded w-1/2"
              />
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="font-medium">Receptor</legend>
          {["nombre", "cif", "direccion"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(receptor as any)[field]}
              onChange={(e) =>
                setReceptor({ ...receptor, [field]: e.target.value })
              }
              className="border px-3 py-2 rounded w-full"
            />
          ))}
          <div className="flex gap-2">
            {["cp", "ciudad"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.toUpperCase()}
                value={(receptor as any)[field]}
                onChange={(e) =>
                  setReceptor({ ...receptor, [field]: e.target.value })
                }
                className="border px-3 py-2 rounded w-1/2"
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Aquí podrías añadir UI para editar lineasRaw, iva e irpf... */}

      <button
        onClick={enviarVerifactu}
        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Enviar a Verifactu
      </button>
    </main>
  );
}
