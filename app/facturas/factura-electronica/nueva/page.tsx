"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
<<<<<<< HEAD
=======
import autoTable from "jspdf-autotable";
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaElectronicaPage() {
  const [emisorNombre, setEmisorNombre] = useState("");
  const [emisorNIF, setEmisorNIF] = useState("");
  const [receptorNombre, setReceptorNombre] = useState("");
  const [receptorNIF, setReceptorNIF] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [vat, setVat] = useState(21);

<<<<<<< HEAD
  const contRef = useRef<HTMLDivElement>(null);

  // Cálculos
  const base = lineas.reduce(
    (sum, l) => sum + l.unidades * l.precioUnitario,
    0
  );
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  // Añadir/quitar líneas
=======
  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  const contRef = useRef<HTMLDivElement>(null);

>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

<<<<<<< HEAD
  // Exportar CSV
  const exportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ['Descripción','Unidades','Precio Unit. (€)','Precio (€)'];
    const rows = lineas.map(l => [
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);

    let csv = BOM + headers.join(";") + "\n";
    for (const row of rows) {
      csv += row.map(cell => `"${cell}"`).join(";") + "\n";
    }
    csv += "\n";
    csv += `BASE IMPONIBLE;${base.toFixed(2)}\n`;
    csv += `IVA (${vat} %);${ivaImport.toFixed(2)}\n`;
    csv += `TOTAL;${total.toFixed(2)}\n`;

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
    if (!contRef.current) return;
    const canvas = await html2canvas(contRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("factura-electronica.pdf");
=======
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1) Cabecera
    const margin = 40;
    doc.setFontSize(18).setTextColor("#0066CC").text("Factura", margin, 60);
    doc.setFontSize(12).setTextColor("#333");
    const hoy = new Date().toLocaleDateString("es-ES");
    doc.text(`Fecha de factura: ${hoy}`, pageWidth - margin - 200, 60);
    doc.text(`Número de factura: 2024-001`, pageWidth - margin - 200, 80);
    doc.text(`Vto: ${new Date(Date.now()+864e5).toLocaleDateString("es-ES")}`, pageWidth - margin - 200, 100);

    // 2) Emisor / Receptor
    doc.setFontSize(11).setTextColor("#0066CC");
    doc.text(emisorNombre || "–", margin, 140);
    doc.setFontSize(10).setTextColor("#333");
    doc.text(`NIF: ${emisorNIF || "–"}`, margin, 160);

    doc.setFontSize(11).setTextColor("#0066CC");
    doc.text(receptorNombre || "–", pageWidth/2 + 10, 140);
    doc.setFontSize(10).setTextColor("#333");
    doc.text(`NIF: ${receptorNIF || "–"}`, pageWidth/2 + 10, 160);

    // 3) Tabla de líneas
    autoTable(doc, {
      startY: 190,
      head: [["Descripción","Unidades","Precio U. (€)","Importe (€)"]],
      body: lineas.map(l => [
        l.descripcion || "–",
        l.unidades.toString(),
        l.precioUnitario.toFixed(2),
        (l.unidades*l.precioUnitario).toFixed(2),
      ]),
      headStyles: { fillColor: "#E6F0FF", textColor: "#0066CC", halign: "center" },
      styles: { fontSize: 10, textColor: "#333" },
      columnStyles: {
        1: { halign: "center", cellWidth: 60 },
        2: { halign: "right", cellWidth: 80 },
        3: { halign: "right", cellWidth: 80 },
      },
      margin: { left: margin, right: margin },
    });

    // 4) Resumen al pie de página
    const finalY = doc.lastAutoTable.finalY! + 20;
    doc.setFontSize(10).setTextColor("#333");
    doc.text(`BASE IMPONIBLE:`, pageWidth - margin - 120, finalY);
    doc.text(`${base.toFixed(2)} €`, pageWidth - margin, finalY, { align: "right" });
    doc.text(`IVA (${vat}%):`, pageWidth - margin - 120, finalY + 15);
    doc.text(`${ivaImport.toFixed(2)} €`, pageWidth - margin, finalY + 15, { align: "right" });
    doc.setFontSize(12).setTextColor("#000");
    doc.text(`TOTAL:`, pageWidth - margin - 120, finalY + 35);
    doc.text(`${total.toFixed(2)} €`, pageWidth - margin, finalY + 35, { align: "right" });

    // 5) Comentarios
    doc.setFontSize(10).setTextColor("#0066CC").text("Comentarios:", margin, finalY + 60);
    doc.setFontSize(10).setTextColor("#333").text(
      "Pago por transferencia: ESXXXXXXXXXXXXXXX9",
      margin + 70,
      finalY + 60
    );

    doc.save("factura-electronica.pdf");
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
  };

  return (
    <div className="py-8 px-4">
      <div
        ref={contRef}
        className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-800">
          Nueva Factura Electrónica
        </h1>

<<<<<<< HEAD
        {/* Datos Emisor / Receptor */}
=======
        {/* Emisor / Receptor */}
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Nombre Emisor
            </label>
            <input
              value={emisorNombre}
              onChange={e => setEmisorNombre(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
<<<<<<< HEAD
              placeholder="Ej. Mi empresa S.L."
=======
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              NIF Emisor
            </label>
            <input
              value={emisorNIF}
              onChange={e => setEmisorNIF(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
<<<<<<< HEAD
              placeholder="B12345678"
=======
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Nombre Receptor
            </label>
            <input
              value={receptorNombre}
              onChange={e => setReceptorNombre(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
<<<<<<< HEAD
              placeholder="Ej. Cliente S.A."
=======
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              NIF Receptor
            </label>
            <input
              value={receptorNIF}
              onChange={e => setReceptorNIF(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
<<<<<<< HEAD
              placeholder="A87654321"
=======
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
            />
          </div>
        </div>

<<<<<<< HEAD
        {/* Líneas */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Conceptos
          </h2>
          <div className="space-y-3">
            {lineas.map((l, i) => (
              <div key={i} className="flex gap-2 items-end">
                <input
=======
        {/* Conceptos */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">Conceptos</h2>
          <div className="space-y-2">
            {lineas.map((l, i) => (
              <div key={i} className="flex gap-2 items-end">
                <input
                  placeholder="Descripción"
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
                  value={l.descripcion}
                  onChange={e => {
                    const v = [...lineas];
                    v[i].descripcion = e.target.value;
                    setLineas(v);
                  }}
                  className="flex-1 border rounded px-3 py-2"
<<<<<<< HEAD
                  placeholder="Descripción"
                />
                <input
                  type="number"
                  value={l.unidades}
                  onChange={e => {
                    const v = [...lineas];
                    v[i].unidades = Number(e.target.value);
                    setLineas(v);
                  }}
                  className="w-20 border rounded px-3 py-2"
                  placeholder="Unidades"
                />
                <input
                  type="number"
                  value={l.precioUnitario}
                  onChange={e => {
                    const v = [...lineas];
                    v[i].precioUnitario = Number(e.target.value);
                    setLineas(v);
                  }}
                  className="w-32 border rounded px-3 py-2"
                  placeholder="€/Ud."
=======
                />
                <input
                  type="number"
                  placeholder="Unidades"
                  value={l.unidades}
                  onChange={e => {
                    const v = [...lineas];
                    v[i].unidades = +e.target.value;
                    setLineas(v);
                  }}
                  className="w-20 border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="€/Ud."
                  value={l.precioUnitario}
                  onChange={e => {
                    const v = [...lineas];
                    v[i].precioUnitario = +e.target.value;
                    setLineas(v);
                  }}
                  className="w-32 border rounded px-3 py-2"
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
                />
                <button
                  onClick={() => removeLinea(i)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addLinea}
              className="mt-2 text-indigo-600 hover:underline"
            >
              + Añadir línea
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* IVA */}
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-600">
            IVA (%)
          </label>
          <input
            type="number"
            value={vat}
            onChange={e => setVat(Number(e.target.value))}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded flex flex-col items-end space-y-1 text-gray-800">
          <div>
            <span className="font-medium">Base imponible:</span>{" "}
            {base.toFixed(2)} €
          </div>
          <div>
            <span className="font-medium">IVA ({vat}%):</span>{" "}
            {ivaImport.toFixed(2)} €
          </div>
          <div className="text-xl font-bold">
            Total: {total.toFixed(2)} €
          </div>
        </div>

      </div>

      {/* Botones de exportación */}
      <div className="max-w-3xl mx-auto mt-6 flex gap-4">
        <button
          onClick={exportCSV}
          className="flex-1 bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50"
        >
          Exportar CSV
        </button>
        <button
          onClick={exportPDF}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Exportar PDF
        </button>
        <button
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
=======
        {/* IVA y resumen */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-600">
              IVA (%)
            </label>
            <input
              type="number"
              value={vat}
              onChange={e => setVat(+e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div className="bg-gray-50 p-4 rounded flex flex-col items-end space-y-1 text-gray-800">
            <div>
              <span className="font-medium">Base imponible:</span>{" "}
              {base.toFixed(2)} €
            </div>
            <div>
              <span className="font-medium">IVA ({vat}%):</span>{" "}
              {ivaImport.toFixed(2)} €
            </div>
            <div className="text-xl font-bold">Total: {total.toFixed(2)} €</div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="max-w-3xl mx-auto mt-6 flex gap-4">
        <button
          onClick={exportPDF}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
>>>>>>> aba443c (Mi mensaje de commit con los cambios listos para subir)
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
}
