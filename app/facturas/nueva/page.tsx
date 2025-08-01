"use client";

import { useState } from "react";

export default function NuevaFactura() {
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [emisor, setEmisor] = useState("");
  const [receptor, setReceptor] = useState("");
  const [concepto, setConcepto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState(0);
  const [iva, setIva] = useState(21);
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie,
          numero,
          fechaEmision,
          fechaVencimiento,
          emisor,
          receptor,
          concepto,
          cantidad,
          precio,
          iva,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Factura guardada correctamente");
      } else {
        alert("Error guardando factura: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar factura");
    } finally {
      setLoading(false);
    }
  };

  const handleFacturae = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sii/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie,
          numero,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Facturae generada y enviada correctamente");
      } else {
        alert("Error en Facturae: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error enviando Facturae");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifactu = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/verifactu/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie,
          numero,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Factura enviada a Verifactu correctamente");
      } else {
        alert("Error en Verifactu: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error enviando Verifactu");
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async () => {
    try {
      const res = await fetch("/api/facturas/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serie, numero }),
      });

      if (!res.ok) throw new Error("Error generando PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Factura-${serie}-${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Error exportando PDF");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Crear Factura</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="input" placeholder="Serie" value={serie} onChange={(e) => setSerie(e.target.value)} />
        <input className="input" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <input className="input" type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
        <input className="input" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
        <input className="input" placeholder="Emisor" value={emisor} onChange={(e) => setEmisor(e.target.value)} />
        <input className="input" placeholder="Receptor (ID del cliente)" value={receptor} onChange={(e) => setReceptor(e.target.value)} />
      </div>

      <textarea
        className="input w-full mb-4"
        placeholder="Concepto"
        value={concepto}
        onChange={(e) => setConcepto(e.target.value)}
      />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <input className="input" type="number" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(+e.target.value)} />
        <input className="input" type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(+e.target.value)} />
        <input className="input" type="number" placeholder="IVA %" value={iva} onChange={(e) => setIva(+e.target.value)} />
      </div>

      <button
        onClick={handleGuardar}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Guardar Factura
      </button>

      <div className="flex justify-between mt-4">
        <button onClick={handlePDF} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Exportar PDF
        </button>
        <button onClick={handleVerifactu} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Enviar Verifactu
        </button>
        <button onClick={handleFacturae} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
          Facturae
        </button>
      </div>

      <style jsx>{`
        .input {
          border: 1px solid #ddd;
          padding: 0.5rem;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
