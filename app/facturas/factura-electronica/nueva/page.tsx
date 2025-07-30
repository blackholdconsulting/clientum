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
  const contRef = useRef<HTMLDivElement>(null);

  const [emisor, setEmisor] = useState({
    nombre: "",
    direccion: "",
    cp: "",
    ciudad: "",
    nif: "",
    email: "",
  });
  const [receptor, setReceptor] = useState({
    nombre: "",
    direccion: "",
    cp: "",
    ciudad: "",
    nif: "",
    email: "",
  });
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [vat, setVat] = useState(21);
  const [comentarios, setComentarios] = useState("");
  const [iban, setIban] = useState("");

  // Cálculos
  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  // Exportar CSV (opcional)
  const exportCSV = () => {
    const headers = [
      "Descripción",
      "Unidades",
      "Precio Unit. (€)",
      "Precio (€)",
    ];
    const rows = lineas.map((l) => [
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);
    const summary = [
      ["Base imponible:", base.toFixed(2) + " €"],
      [`IVA (${vat}%):`, ivaImport.toFixed(2) + " €"],
      ["Total:", total.toFixed(2) + " €"],
    ];
    const csvContent =
      "\uFEFF" +
      [headers, ...rows, ...summary].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "factura-electronica.csv";
    a.click();
  };

  // Exportar PDF con jsPDF + autoTable
  const exportPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.text("FACTURA", pageWidth - 80, 40, { align: "right" });

    doc.setFontSize(10);
    const lineHeight = 14;
    let y = 60;

    // Fechas (fijas o configurables si lo deseas)
    doc.text(`Fecha de factura: ${new Date().toLocaleDateString()}`, 40, y);
    y += lineHeight;
    doc.text(`Número de factura: 2024-0001`, 40, y);
    y += lineHeight;
    doc.text(`Fecha de vencimiento: ${new Date(Date.now() + 86400000).toLocaleDateString()}`, 40, y);

    // Línea horizontal
    doc.setLineWidth(0.5);
    doc.line(40, y + 6, pageWidth - 40, y + 6);

    // Emisor / Receptor
    y += 30;
    doc.setFontSize(12);
    doc.text("Emisor:", 40, y);
    doc.text("Receptor:", pageWidth / 2 + 20, y);
    doc.setFontSize(10);
    y += lineHeight;
    doc.text(emisor.nombre, 40, y);
    doc.text(receptor.nombre, pageWidth / 2 + 20, y);
    y += lineHeight;
    doc.text(`Dirección: ${emisor.direccion}`, 40, y);
    doc.text(`Dirección: ${receptor.direccion}`, pageWidth / 2 + 20, y);
    y += lineHeight;
    doc.text(`CP ${emisor.cp} · ${emisor.ciudad}`, 40, y);
    doc.text(`CP ${receptor.cp} · ${receptor.ciudad}`, pageWidth / 2 + 20, y);
    y += lineHeight;
    doc.text(`NIF: ${emisor.nif}`, 40, y);
    doc.text(`NIF: ${receptor.nif}`, pageWidth / 2 + 20, y);
    y += lineHeight;
    doc.text(`Email: ${emisor.email}`, 40, y);
    doc.text(`Email: ${receptor.email}`, pageWidth / 2 + 20, y);

    // Tabla de líneas
    y += 30;
    const tableColumns = [
      { header: "Descripción", dataKey: "descripcion" },
      { header: "Unidades", dataKey: "unidades" },
      { header: "Precio Unit. (€)", dataKey: "precioUnitario" },
      { header: "Precio (€)", dataKey: "precio" },
    ];
    const tableData = lineas.map((l) => ({
      descripcion: l.descripcion,
      unidades: l.unidades,
      precioUnitario: l.precioUnitario.toFixed(2),
      precio: (l.unidades * l.precioUnitario).toFixed(2),
    }));

    autoTable(doc, {
      startY: y,
      head: [tableColumns.map((c) => c.header)],
      body: tableData.map((row) => Object.values(row)),
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [230, 230, 230] },
      margin: { left: 40, right: 40 },
    });

    // Totales
    y = (doc as any).lastAutoTable.finalY + 20;
    doc.text(`Base imponible:`, pageWidth - 200, y);
    doc.text(`${base.toFixed(2)} €`, pageWidth - 80, y, { align: "right" });
    y += lineHeight;
    doc.text(`IVA (${vat}%):`, pageWidth - 200, y);
    doc.text(`${ivaImport.toFixed(2)} €`, pageWidth - 80, y, { align: "right" });
    y += lineHeight;
    doc.setFontSize(14);
    doc.text(`Total:`, pageWidth - 200, y);
    doc.text(`${total.toFixed(2)} €`, pageWidth - 80, y, { align: "right" });

    // Comentarios + IBAN
    y += 30;
    doc.setFontSize(10);
    doc.text(`Comentarios: ${comentarios}`, 40, y);
    y += lineHeight;
    doc.text(`IBAN: ${iban}`, 40, y);

    doc.save("factura-electronica.pdf");
  };

  return (
    <div className="py-8 px-4">
      <div ref={contRef} className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        {/* Emisor / Receptor */}
        <div className="grid grid-cols-2 gap-4">
          {/** EMISOR */}
          <div className="space-y-2">
            <label>Nombre Emisor</label>
            <input
              type="text"
              value={emisor.nombre}
              onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Mi empresa S.L."
            />
            <label>Dirección</label>
            <input
              type="text"
              value={emisor.direccion}
              onChange={(e) => setEmisor({ ...emisor, direccion: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Calle Falsa 123"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={emisor.cp}
                onChange={(e) => setEmisor({ ...emisor, cp: e.target.value })}
                className="w-1/2 border rounded px-3 py-2"
                placeholder="CP"
              />
              <input
                type="text"
                value={emisor.ciudad}
                onChange={(e) => setEmisor({ ...emisor, ciudad: e.target.value })}
                className="w-1/2 border rounded px-3 py-2"
                placeholder="Ciudad"
              />
            </div>
            <label>NIF</label>
            <input
              type="text"
              value={emisor.nif}
              onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="B12345678"
            />
            <label>Email</label>
            <input
              type="email"
              value={emisor.email}
              onChange={(e) => setEmisor({ ...emisor, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="info@empresa.es"
            />
          </div>

          {/** RECEPTOR */}
          <div className="space-y-2">
            <label>Nombre Receptor</label>
            <input
              type="text"
              value={receptor.nombre}
              onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Cliente S.A."
            />
            <label>Dirección</label>
            <input
              type="text"
              value={receptor.direccion}
              onChange={(e) => setReceptor({ ...receptor, direccion: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Av. Siempre Viva 742"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={receptor.cp}
                onChange={(e) => setReceptor({ ...receptor, cp: e.target.value })}
                className="w-1/2 border rounded px-3 py-2"
                placeholder="CP"
              />
              <input
                type="text"
                value={receptor.ciudad}
                onChange={(e) => setReceptor({ ...receptor, ciudad: e.target.value })}
                className="w-1/2 border rounded px-3 py-2"
                placeholder="Ciudad"
              />
            </div>
            <label>NIF</label>
            <input
              type="text"
              value={receptor.nif}
              onChange={(e) => setReceptor({ ...receptor, nif: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="A87654321"
            />
            <label>Email</label>
            <input
              type="email"
              value={receptor.email}
              onChange={(e) => setReceptor({ ...receptor, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="contacto@cliente.es"
            />
          </div>
        </div>

        {/* Líneas */}
        <div>
          <h2 className="font-semibold mb-2">Conceptos</h2>
          {lineas.map((l, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <input
                type="text"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => {
                  const nuevos = [...lineas];
                  nuevos[i].descripcion = e.target.value;
                  setLineas(nuevos);
                }}
                className="flex-1 border rounded px-3 py-2"
              />
              <input
                type="number"
                className="w-20 border rounded px-2 py-2 text-center"
                value={l.unidades}
                onChange={(e) => {
                  const nuevos = [...lineas];
                  nuevos[i].unidades = parseInt(e.target.value) || 0;
                  setLineas(nuevos);
                }}
              />
              <input
                type="number"
                className="w-24 border rounded px-2 py-2 text-center"
                value={l.precioUnitario}
                onChange={(e) => {
                  const nuevos = [...lineas];
                  nuevos[i].precioUnitario = parseFloat(e.target.value) || 0;
                  setLineas(nuevos);
                }}
              />
              <button
                onClick={() => removeLinea(i)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                ×
              </button>
            </div>
          ))}
          <button onClick={addLinea} className="text-indigo-600 hover:underline">
            + Añadir línea
          </button>
        </div>

        {/* IVA */}
        <div className="mt-4">
          <label>IVA (%)</label>
          <input
            type="number"
            className="w-24 border rounded px-2 py-2 ml-2"
            value={vat}
            onChange={(e) => setVat(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Totales + Comentarios/IBAN */}
        <div className="bg-gray-50 p-4 rounded mt-6">
          <div className="flex justify-end space-x-8">
            <div>Base imponible:</div>
            <div>{base.toFixed(2)} €</div>
          </div>
          <div className="flex justify-end space-x-8">
            <div>IVA ({vat}%):</div>
            <div>{ivaImport.toFixed(2)} €</div>
          </div>
          <div className="flex justify-end space-x-8 font-semibold text-lg mt-2">
            <div>Total:</div>
            <div>{total.toFixed(2)} €</div>
          </div>
        </div>

        <div className="space-y-2">
          <label>Comentarios</label>
          <input
            type="text"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Pago por transferencia"
          />
          <label>IBAN</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="ESXXXXXXXXXXXXXXX9"
          />
        </div>
      </div>

      {/* Botones de acción */}
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
      </div>
    </div>
  );
}
