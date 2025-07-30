"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaElectronicaPage() {
  const [emisorName, setEmisorName] = useState("");
  const [emisorNIF, setEmisorNIF] = useState("");
  const [receptorName, setReceptorName] = useState("");
  const [receptorNIF, setReceptorNIF] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [vat, setVat] = useState(21);
  const contRef = useRef<HTMLDivElement>(null);

  // Cálculos
  const base = lineas.reduce(
    (sum, l) => sum + l.unidades * l.precioUnitario,
    0
  );
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  // Añadir / quitar líneas
  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  // Exportar CSV
  const exportCSV = () => {
    const headers = ["Descripción", "Unidades", "Precio Unit.", "Subtotal"];
    const rows = lineas.map((l) => [
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);
    rows.push(["Base imponible", "", "", base.toFixed(2)]);
    rows.push([`IVA (${vat}%)`, "", "", ivaImport.toFixed(2)]);
    rows.push(["Total", "", "", total.toFixed(2)]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${c}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "factura-electronica.csv";
    a.click();
  };

  // Exportar PDF
  const exportPDF = async () => {
    if (!contRef.current) return;
    const canvas = await html2canvas(contRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("factura-electronica.pdf");
  };

  // Envío a AEAT
  const enviarAEAT = async () => {
    try {
      await axios.post("/api/factura-electronica", {
        emisorName,
        emisorNIF,
        receptorName,
        receptorNIF,
        lineas,
        vat,
      });
      alert("Factura enviada correctamente a la AEAT.");
    } catch (err) {
      console.error(err);
      alert("Error al enviar la factura a la AEAT.");
    }
  };

  return (
    <div className="py-8 px-4">
      <div
        ref={contRef}
        className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        {/* Emisor / Receptor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Nombre Emisor"
            value={emisorName}
            onChange={(e) => setEmisorName(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="NIF Emisor"
            value={emisorNIF}
            onChange={(e) => setEmisorNIF(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Nombre Receptor"
            value={receptorName}
            onChange={(e) => setReceptorName(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="NIF Receptor"
            value={receptorNIF}
            onChange={(e) => setReceptorNIF(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Conceptos */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              placeholder="Descripción"
              value={lineas[0].descripcion}
              onChange={(e) => {
                const newL = [...lineas];
                newL[0].descripcion = e.target.value;
                setLineas(newL);
              }}
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              type="number"
              min={1}
              placeholder="Unid."
              value={lineas[0].unidades}
              onChange={(e) => {
                const newL = [...lineas];
                newL[0].unidades = +e.target.value;
                setLineas(newL);
              }}
              className="w-20 border rounded px-3 py-2"
            />
            <input
              type="number"
              min={0}
              placeholder="Precio"
              value={lineas[0].precioUnitario}
              onChange={(e) => {
                const newL = [...lineas];
                newL[0].precioUnitario = +e.target.value;
                setLineas(newL);
              }}
              className="w-24 border rounded px-3 py-2"
            />
            <button
              onClick={() => removeLinea(0)}
              className="bg-red-500 text-white px-3 rounded"
            >
              ×
            </button>
          </div>
          <button
            onClick={addLinea}
            className="text-indigo-600 hover:underline"
          >
            + Añadir línea
          </button>
        </div>

        {/* IVA */}
        <div className="w-32">
          <label className="block text-sm">IVA (%)</label>
          <input
            type="number"
            min={0}
            value={vat}
            onChange={(e) => setVat(+e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-100 p-4 rounded flex flex-col items-end space-y-1">
          <div>Base imponible: {base.toFixed(2)} €</div>
          <div>
            IVA ({vat}%): {ivaImport.toFixed(2)} €
          </div>
          <div className="text-lg font-bold">
            Total: {total.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={exportCSV}
          className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
        >
          Exportar CSV
        </button>
        <button
          onClick={exportPDF}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Exportar PDF
        </button>
        <button
          onClick={enviarAEAT}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Enviar a AEAT
        </button>
      </div>
    </div>
);
}
