"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaElectronicaPage() {
  const [emisorNombre, setEmisorNombre] = useState("Mi empresa S.L.");
  const [emisorNIF, setEmisorNIF] = useState("B12345678");
  const [receptorNombre, setReceptorNombre] = useState("Cliente S.A.");
  const [receptorNIF, setReceptorNIF] = useState("A87654321");
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [vat, setVat] = useState(21);
  const contRef = useRef<HTMLDivElement>(null);

  // cálculos
  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = +(base * vat / 100).toFixed(2);
  const total = +(base + ivaImport).toFixed(2);

  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  // Exportar CSV (opcional)
  const exportCSV = () => {
    const rows = lineas.map(l => [
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);
    const header = ["Descripción", "Unidades", "Precio Unitario (€)", "Precio (€)"];
    const footer = [
      [],
      ["BASE IMPONIBLE:", "", "", base.toFixed(2)],
      [`IVA (${vat} %):`, "", "", ivaImport.toFixed(2)],
      ["TOTAL:", "", "", total.toFixed(2)],
    ];
    const csv =
      [header, ...rows, ...footer]
        .map(r => r.map(cell => `"${cell}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "factura-electronica.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar PDF
  const exportPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1) Logo
    const img = new Image();
    img.src = "/logo.png"; // pon aquí la ruta a tu logo en /public
    await new Promise(r => (img.onload = r));
    doc.addImage(img, "PNG", 40, 30, 100, 30);

    // 2) Cabecera título + fechas
    doc.setFontSize(18);
    doc.text("Factura Electrónica", pageWidth - 150, 50, { align: "right" });
    doc.setFontSize(10);
    const hoy = new Date().toLocaleDateString();
    doc.text(`Fecha: ${hoy}`, pageWidth - 150, 70, { align: "right" });
    doc.text(`Nº factura: 2024-001`, pageWidth - 150, 85, { align: "right" });

    // 3) Datos emisor/receptor
    doc.setFontSize(11);
    doc.text("Emisor:", 40, 110);
    doc.text(`${emisorNombre}`, 40, 125);
    doc.text(`NIF: ${emisorNIF}`, 40, 140);

    doc.text("Receptor:", pageWidth / 2 + 20, 110);
    doc.text(`${receptorNombre}`, pageWidth / 2 + 20, 125);
    doc.text(`NIF: ${receptorNIF}`, pageWidth / 2 + 20, 140);

    // 4) Tabla de líneas
    autoTable(doc, {
      startY: 160,
      head: [["Descripción", "Unidades", "P. Unit (€)", "Precio (€)"]],
      body: lineas.map(l => [
        l.descripcion,
        l.unidades.toString(),
        l.precioUnitario.toFixed(2),
        (l.unidades * l.precioUnitario).toFixed(2),
      ]),
      theme: "grid",
      styles: { cellPadding: 4, fontSize: 10 },
      headStyles: { fillColor: [30, 144, 255], textColor: 255 },
    });

    // 5) Totales al pie de tabla
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(11);
    doc.text(`Base imponible:`, pageWidth - 200, finalY);
    doc.text(base.toFixed(2) + " €", pageWidth - 40, finalY, { align: "right" });
    doc.text(`IVA (${vat} %):`, pageWidth - 200, finalY + 15);
    doc.text(ivaImport.toFixed(2) + " €", pageWidth - 40, finalY + 15, { align: "right" });
    doc.setFontSize(13);
    doc.text(`Total:`, pageWidth - 200, finalY + 35);
    doc.text(total.toFixed(2) + " €", pageWidth - 40, finalY + 35, { align: "right" });

    // 6) Comentarios / pie
    doc.setFontSize(9);
    doc.text("Comentarios:", 40, finalY + 70);
    doc.text("Pago por transferencia: ESXXXXXXXXXXXXXX9", 40, finalY + 85);

    // Guardar
    doc.save("factura-electronica.pdf");
  };

  return (
    <div className="py-8 px-4">
      <div
        ref={contRef}
        className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            value={emisorNombre}
            onChange={e => setEmisorNombre(e.target.value)}
            placeholder="Nombre Emisor"
          />
          <input
            className="border rounded px-3 py-2"
            value={emisorNIF}
            onChange={e => setEmisorNIF(e.target.value)}
            placeholder="NIF Emisor"
          />
          <input
            className="border rounded px-3 py-2"
            value={receptorNombre}
            onChange={e => setReceptorNombre(e.target.value)}
            placeholder="Nombre Receptor"
          />
          <input
            className="border rounded px-3 py-2"
            value={receptorNIF}
            onChange={e => setReceptorNIF(e.target.value)}
            placeholder="NIF Receptor"
          />
        </div>

        <h2 className="font-semibold">Conceptos</h2>
        {lineas.map((l, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Descripción"
              value={l.descripcion}
              onChange={e => {
                const arr = [...lineas];
                arr[i].descripcion = e.target.value;
                setLineas(arr);
              }}
            />
            <input
              type="number"
              className="w-20 border rounded px-2 py-2"
              value={l.unidades}
              onChange={e => {
                const arr = [...lineas];
                arr[i].unidades = +e.target.value;
                setLineas(arr);
              }}
            />
            <input
              type="number"
              className="w-28 border rounded px-2 py-2"
              value={l.precioUnitario}
              onChange={e => {
                const arr = [...lineas];
                arr[i].precioUnitario = +e.target.value;
                setLineas(arr);
              }}
            />
            <button
              onClick={() => removeLinea(i)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addLinea}
          className="text-indigo-600 hover:underline"
        >
          + Añadir línea
        </button>

        <div className="flex items-center gap-4">
          <label className="font-medium">IVA (%)</label>
          <input
            type="number"
            className="w-20 border rounded px-2 py-2"
            value={vat}
            onChange={e => setVat(+e.target.value)}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded text-right">
          <div>Base imponible: <strong>{base.toFixed(2)} €</strong></div>
          <div>IVA ({vat}%): <strong>{ivaImport.toFixed(2)} €</strong></div>
          <div className="mt-2 text-lg">Total: <strong>{total.toFixed(2)} €</strong></div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
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
      </div>
    </div>
  );
}
