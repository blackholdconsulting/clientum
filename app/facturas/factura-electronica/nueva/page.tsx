"use client";

import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaElectronicaPage() {
  const user = useUser();
  const [emisor, setEmisor] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    ciudad: "",
    cp: "",
    provincia: "",
    pais: "ESP",
  });
  const [receptor, setReceptor] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    ciudad: "",
    cp: "",
    provincia: "",
    pais: "ESP",
  });
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [vat, setVat] = useState(21);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPass, setCertPass] = useState("");

  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  // Handler para enviar a AEAT
  const handleSendVerifactu = async () => {
    if (!user) return alert("Debes iniciar sesión.");
    if (!certFile) return alert("Sube un certificado digital.");
    if (!certPass) return alert("Introduce la contraseña del certificado.");

    // Convertir certificado a base64
    const buffer = await certFile.arrayBuffer();
    const certificadoBase64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Datos de la factura
    const facturaData = {
      numeroFactura: "FAC-" + Date.now(),
      fecha: new Date(),
      emisor,
      cliente: receptor,
      lineas: lineas.map((l) => ({
        descripcion: l.descripcion,
        cantidad: l.unidades,
        precioUnitario: l.precioUnitario,
        iva: vat,
      })),
    };

    // Llamada al endpoint
    const response = await fetch("/api/sii/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facturaData,
        userId: user.id,
        certificado: certificadoBase64,
        password: certPass,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`Factura enviada correctamente. Estado: ${data.result.estado}`);
    } else {
      alert("Error enviando factura: " + data.error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Nueva Factura Electrónica</h1>

      {/* Emisor */}
      <h2 className="text-lg font-semibold mt-4">Datos del Emisor</h2>
      <input
        placeholder="Nombre"
        value={emisor.nombre}
        onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
        className="border p-2 w-full my-1"
      />
      <input
        placeholder="NIF"
        value={emisor.nif}
        onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
        className="border p-2 w-full my-1"
      />

      {/* Receptor */}
      <h2 className="text-lg font-semibold mt-4">Datos del Receptor</h2>
      <input
        placeholder="Nombre"
        value={receptor.nombre}
        onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
        className="border p-2 w-full my-1"
      />
      <input
        placeholder="NIF"
        value={receptor.nif}
        onChange={(e) => setReceptor({ ...receptor, nif: e.target.value })}
        className="border p-2 w-full my-1"
      />

      {/* Conceptos */}
      <h2 className="text-lg font-semibold mt-4">Conceptos</h2>
      {lineas.map((linea, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            placeholder="Descripción"
            value={linea.descripcion}
            onChange={(e) => {
              const arr = [...lineas];
              arr[i].descripcion = e.target.value;
              setLineas(arr);
            }}
            className="border p-2 flex-1"
          />
          <input
            type="number"
            value={linea.unidades}
            onChange={(e) => {
              const arr = [...lineas];
              arr[i].unidades = Number(e.target.value);
              setLineas(arr);
            }}
            className="border p-2 w-24"
          />
          <input
            type="number"
            value={linea.precioUnitario}
            onChange={(e) => {
              const arr = [...lineas];
              arr[i].precioUnitario = Number(e.target.value);
              setLineas(arr);
            }}
            className="border p-2 w-24"
          />
        </div>
      ))}
      <button
        onClick={() =>
          setLineas([
            ...lineas,
            { descripcion: "", unidades: 1, precioUnitario: 0 },
          ])
        }
        className="text-indigo-600 mb-4"
      >
        + Añadir línea
      </button>

      {/* Certificado */}
      <h2 className="text-lg font-semibold mt-4">Certificado Digital</h2>
      <input
        type="file"
        onChange={(e) => setCertFile(e.target.files?.[0] || null)}
        className="border p-2 w-full my-1"
      />
      <input
        type="password"
        placeholder="Contraseña del certificado"
        value={certPass}
        onChange={(e) => setCertPass(e.target.value)}
        className="border p-2 w-full my-1"
      />

      {/* Totales */}
      <div className="mt-4 bg-gray-100 p-4 rounded">
        <p>Base: {base.toFixed(2)} €</p>
        <p>IVA: {ivaImport.toFixed(2)} €</p>
        <p>Total: {total.toFixed(2)} €</p>
      </div>

      {/* Botón enviar */}
      <button
        onClick={handleSendVerifactu}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Enviar Verifactu
      </button>
    </div>
  );
}
