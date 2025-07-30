"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import axios from "axios";

// Si tienes el logo en público puedes cargarlo así:
// import logoDataUrl from "/public/logo.png";

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

  // Exportar PDF con formato tipo Holded/Declarando
  const exportPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1) Cabecera: Logo + Título
    // Si tienes logoDataUrl (base64 o import), úsalo aquí:
    // doc.addImage(logoDataUrl, "PNG", 40, 40, 120, 40);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", pageWidth - 60, 50, { align: "right" });

    // 2) Datos de factura (fecha, nº y vencimiento)
    const leftColX = 40;
    let y = 80;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de factura: ${new Date().toLocaleDateString()}`, leftColX, y);
    doc.text(`Número de factura: 2024-0001`, leftColX, y + 14);
    doc.text(`Fecha de vencimiento: ${new Date(Date.now() + 86400000).toLocaleDateString()}`, leftColX, y + 28);

    // 3) Emisor / Receptor
    const midX = pageWidth / 2;
    y += 50;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(leftColX, y, pageWidth - 40, y);

    y += 16;
    doc.setFont("helvetica", "bold");
    doc.text("Emisor:", leftColX, y);
    doc.text("Receptor:", midX, y);

    doc.setFont("helvetica", "normal");
    y += 14;
    doc.text(emisorName || "Mi empresa S.L.", leftColX, y);
    doc.text(receptorName || "Cliente S.A.", midX, y);

    y += 14;
    doc.text(`NIF: ${emisorNIF || "B12345678"}`, leftColX, y);
    doc.text(`NIF: ${receptorNIF || "A87654321"}`, midX, y);

    // 4) Tabla de líneas
    y += 20;
    const tableColumns = [
      { header: "Descripción", dataKey: "descripcion" },
      { header: "Unidades", dataKey: "unidades" },
      { header: "Precio Unit. (€)", dataKey: "precioUnitario" },
      { header: "Precio (€)", dataKey: "subtotal" },
    ];
    const tableData = lineas.map((l) => ({
      descripcion: l.descripcion,
      unidades: l.unidades,
      precioUnitario: l.precioUnitario.toFixed(2),
      subtotal: (l.unidades * l.precioUnitario).toFixed(2),
    }));

    (autoTable as UserOptions)(doc, {
      startY: y,
      head: [tableColumns.map((c) => c.header)],
      body: tableData.map((row) => Object.values(row)),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240], textColor: 30, halign: "center" },
      columnStyles: { 0: { cellWidth: 200 }, 1: { cellWidth: 60 }, 2: { cellWidth: 80 }, 3: { cellWidth: 80 } },
    });

    // 5) Resumen al final
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Base imponible:`, pageWidth - 200, finalY);
    doc.text(`${base.toFixed(2)} €`, pageWidth - 80, finalY, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(`IVA (${vat} %):`, pageWidth - 200, finalY + 14);
    doc.text(`${ivaImport.toFixed(2)} €`, pageWidth - 80, finalY + 14, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text(`Total:`, pageWidth - 200, finalY + 30);
    doc.text(`${total.toFixed(2)} €`, pageWidth - 80, finalY + 30, { align: "right" });

    // 6) Comentarios / Pie
    doc.setFontSize(9);
    doc.text(
      `Comentarios: Pago por transferencia: ESXXXXXXXXXXXXXXX9`,
      40,
      finalY + 60
    );

    // Guardar
    doc.save("factura-electronica.pdf");
  };

  // Envío a AEAT (igual que antes)
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

        {/* Formulario resumido */}
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

        {/* IVA y resumen instantáneo */}
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

      {/* Acciones */}
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

