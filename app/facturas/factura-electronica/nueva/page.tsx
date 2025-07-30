"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

  // Cálculos
  const base = lineas.reduce(
    (sum, l) => sum + l.unidades * l.precioUnitario,
    0
  );
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  // Exportar PDF con formato Holded/Declarando
  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1) Cabecera
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", pageWidth - 60, 50, { align: "right" });

    // 2) Datos de factura
    const leftX = 40;
    let y = 80;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de factura: ${new Date().toLocaleDateString()}`, leftX, y);
    doc.text(`Número de factura: 2024-0001`, leftX, y + 14);
    doc.text(
      `Fecha de vencimiento: ${new Date(Date.now() + 86400000).toLocaleDateString()}`,
      leftX,
      y + 28
    );

    // 3) Emisor / Receptor
    const midX = pageWidth / 2;
    y += 50;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(leftX, y, pageWidth - 40, y);

    y += 16;
    doc.setFont("helvetica", "bold");
    doc.text("Emisor:", leftX, y);
    doc.text("Receptor:", midX, y);
    doc.setFont("helvetica", "normal");

    y += 14;
    doc.text(emisorName || "Mi empresa S.L.", leftX, y);
    doc.text(receptorName || "Cliente S.A.", midX, y);

    y += 14;
    doc.text(`NIF: ${emisorNIF || "B12345678"}`, leftX, y);
    doc.text(`NIF: ${receptorNIF || "A87654321"}`, midX, y);

    // 4) Tabla de líneas
    y += 28;
    const tableHead = [["Descripción", "Unidades", "Precio Unit. (€)", "Precio (€)"]];
    const tableBody = lineas.map((l) => [
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);

    autoTable(doc, {
      startY: y,
      head: tableHead,
      body: tableBody,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240], textColor: 30, halign: "center" },
      columnStyles: { 0: { cellWidth: 200 }, 1: { cellWidth: 60 }, 2: { cellWidth: 80 }, 3: { cellWidth: 80 } },
    });

    // 5) Resumen
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Base imponible:`, pageWidth - 200, finalY);
    doc.text(`${base.toFixed(2)} €`, pageWidth - 80, finalY, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(`IVA (${vat}%):`, pageWidth - 200, finalY + 14);
    doc.text(`${ivaImport.toFixed(2)} €`, pageWidth - 80, finalY + 14, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text(`Total:`, pageWidth - 200, finalY + 30);
    doc.text(`${total.toFixed(2)} €`, pageWidth - 80, finalY + 30, { align: "right" });

    // 6) Pie de comentarios
    doc.setFontSize(9);
    doc.text(
      `Comentarios: Pago por transferencia: ESXXXXXXXXXXXXXXX9`,
      leftX,
      finalY + 60
    );

    doc.save("factura-electronica.pdf");
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
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        {/* Emisor/Receptor */}
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

        {/* Líneas */}
        {lineas.map((l, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              placeholder="Descripción"
              value={l.descripcion}
              onChange={(e) => {
                const arr = [...lineas];
                arr[i].descripcion = e.target.value;
                setLineas(arr);
              }}
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              type="number"
              min={1}
              value={l.unidades}
              onChange={(e) => {
                const arr = [...lineas];
                arr[i].unidades = +e.target.value;
                setLineas(arr);
              }}
              className="w-20 border rounded px-3 py-2"
            />
            <input
              type="number"
              min={0}
              value={l.precioUnitario}
              onChange={(e) => {
                const arr = [...lineas];
                arr[i].precioUnitario = +e.target.value;
                setLineas(arr);
              }}
              className="w-24 border rounded px-3 py-2"
            />
            <button
              onClick={() => removeLinea(i)}
              className="bg-red-500 text-white px-3 rounded"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addLinea}
          className="text-indigo-600 hover:underline mb-4"
        >
          + Añadir línea
        </button>

        {/* IVA y resumen */}
        <div className="w-32 mb-4">
          <label className="block text-sm">IVA (%)</label>
          <input
            type="number"
            min={0}
            value={vat}
            onChange={(e) => setVat(+e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="bg-gray-100 p-4 rounded flex flex-col items-end space-y-1">
          <div>Base imponible: {base.toFixed(2)} €</div>
          <div>IVA ({vat}%): {ivaImport.toFixed(2)} €</div>
          <div className="text-lg font-bold">Total: {total.toFixed(2)} €</div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-center gap-4 mt-6">
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
