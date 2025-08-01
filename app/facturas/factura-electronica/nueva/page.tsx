"use client";

import { useState } from "react";
import { generateFacturaeXML } from "@/utils/facturae";
import { signFacturaeXML } from "@/utils/signFacturae";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaElectronicaPage() {
  const [emisor, setEmisor] = useState({ nombre: "", nif: "", direccion: "", ciudad: "", cp: "", provincia: "", pais: "ESP" });
  const [receptor, setReceptor] = useState({ nombre: "", nif: "", direccion: "", ciudad: "", cp: "", provincia: "", pais: "ESP" });
  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const [vat, setVat] = useState(21);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPass, setCertPass] = useState("");

  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  const handleEnviarAEAT = async () => {
    if (!certFile) return alert("Sube un certificado digital.");

    const facturaData = {
      numeroFactura: "FAC-" + Date.now(),
      fecha: new Date(),
      emisor,
      cliente: receptor,
      lineas: lineas.map(l => ({ descripcion: l.descripcion, cantidad: l.unidades, precioUnitario: l.precioUnitario, iva: vat }))
    };

    const xml = generateFacturaeXML(facturaData);
    const buffer = await certFile.arrayBuffer();
    const signedXML = signFacturaeXML(xml, Buffer.from(buffer), certPass);

    const res = await fetch("/api/sii/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedXML }),
    });

    const json = await res.json();
    if (json.status === "ok") {
      alert("Factura enviada correctamente a la AEAT.");
    } else {
      alert("Error enviando factura: " + json.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Nueva Factura Electrónica</h1>
      
      {/* Emisor */}
      <h2 className="text-lg font-semibold mt-4">Datos del Emisor</h2>
      <input placeholder="Nombre" value={emisor.nombre} onChange={e => setEmisor({ ...emisor, nombre: e.target.value })} className="border p-2 w-full my-1"/>
      <input placeholder="NIF" value={emisor.nif} onChange={e => setEmisor({ ...emisor, nif: e.target.value })} className="border p-2 w-full my-1"/>

      {/* Receptor */}
      <h2 className="text-lg font-semibold mt-4">Datos del Receptor</h2>
      <input placeholder="Nombre" value={receptor.nombre} onChange={e => setReceptor({ ...receptor, nombre: e.target.value })} className="border p-2 w-full my-1"/>
      <input placeholder="NIF" value={receptor.nif} onChange={e => setReceptor({ ...receptor, nif: e.target.value })} className="border p-2 w-full my-1"/>

      {/* Conceptos */}
      <h2 className="text-lg font-semibold mt-4">Conceptos</h2>
      {lineas.map((linea, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input placeholder="Descripción" value={linea.descripcion} onChange={e => { const arr = [...lineas]; arr[i].descripcion = e.target.value; setLineas(arr); }} className="border p-2 flex-1"/>
          <input type="number" value={linea.unidades} onChange={e => { const arr = [...lineas]; arr[i].unidades = Number(e.target.value); setLineas(arr); }} className="border p-2 w-24"/>
          <input type="number" value={linea.precioUnitario} onChange={e => { const arr = [...lineas]; arr[i].precioUnitario = Number(e.target.value); setLineas(arr); }} className="border p-2 w-24"/>
        </div>
      ))}
      <button onClick={() => setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }])} className="text-indigo-600 mb-4">+ Añadir línea</button>

      {/* Certificado */}
      <h2 className="text-lg font-semibold mt-4">Certificado Digital</h2>
      <input type="file" onChange={e => setCertFile(e.target.files?.[0] || null)} className="border p-2 w-full my-1"/>
      <input type="password" placeholder="Contraseña del certificado" value={certPass} onChange={e => setCertPass(e.target.value)} className="border p-2 w-full my-1"/>

      {/* Totales */}
      <div className="mt-4 bg-gray-100 p-4 rounded">
        <p>Base: {base.toFixed(2)} €</p>
        <p>IVA: {ivaImport.toFixed(2)} €</p>
        <p>Total: {total.toFixed(2)} €</p>
      </div>

      {/* Botón enviar */}
      <button onClick={handleEnviarAEAT} className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        Enviar a AEAT
      </button>
    </div>
  );
}

