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
  // Datos de EMISOR
  const [emiNombre, setEmiNombre] = useState("");
  const [emiDireccion, setEmiDireccion] = useState("");
  const [emiCP, setEmiCP] = useState("");
  const [emiCiudad, setEmiCiudad] = useState("");
  const [emiNIF, setEmiNIF] = useState("");
  const [emiEmail, setEmiEmail] = useState("");

  // Datos de RECEPTOR
  const [recNombre, setRecNombre] = useState("");
  const [recDireccion, setRecDireccion] = useState("");
  const [recCP, setRecCP] = useState("");
  const [recCiudad, setRecCiudad] = useState("");
  const [recNIF, setRecNIF] = useState("");
  const [recEmail, setRecEmail] = useState("");

  // Líneas de factura
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);

  // IVa, comentarios e IBAN
  const [vat, setVat] = useState(21);
  const [comentarios, setComentarios] = useState("");
  const [iban, setIban] = useState("");

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

  // Generar PDF
  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const width = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    // Título
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", width - margin, y, { align: "right" });

    // Fecha y vencimiento
    y += 30;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha de factura: ${new Date().toLocaleDateString()}`, margin, y);
    doc.text(`Número de factura: 2024-0001`, margin, y + 14);
    doc.text(
      `Fecha de vencimiento: ${new Date(Date.now() + 86400000).toLocaleDateString()}`,
      margin,
      y + 28
    );

    // Separador
    y += 50;
    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(margin, y, width - margin, y);

    // Emisor / Receptor
    y += 20;
    const mid = width / 2;
    doc.setFont("helvetica", "bold");
    doc.text("Emisor:", margin, y);
    doc.text("Receptor:", mid, y);
    doc.setFont("helvetica", "normal");

    y += 16;
    doc.text(emiNombre || "Mi empresa S.L.", margin, y);
    doc.text(recNombre || "Cliente S.A.", mid, y);

    y += 14;
    doc.text(emiDireccion, margin, y);
    doc.text(recDireccion, mid, y);

    y += 14;
    doc.text(`CP ${emiCP} · ${emiCiudad}`, margin, y);
    doc.text(`CP ${recCP} · ${recCiudad}`, mid, y);

    y += 14;
    doc.text(`NIF: ${emiNIF}`, margin, y);
    doc.text(`NIF: ${recNIF}`, mid, y);

    y += 14;
    doc.text(`Email: ${emiEmail}`, margin, y);
    doc.text(`Email: ${recEmail}`, mid, y);

    // Tabla de líneas
    y += 30;
    autoTable(doc, {
      startY: y,
      head: [["Descripción", "Unidades", "Precio Unit. (€)", "Precio (€)"]],
      body: lineas.map((l) => [
        l.descripcion,
        l.unidades.toString(),
        l.precioUnitario.toFixed(2),
        (l.unidades * l.precioUnitario).toFixed(2),
      ]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [240, 240, 240], textColor: 30 },
    });

    // Resumen
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFont("helvetica", "bold");
    doc.text("Base imponible:", width - margin - 100, finalY);
    doc.text(`${base.toFixed(2)} €`, width - margin, finalY, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(`IVA (${vat}%):`, width - margin - 100, finalY + 16);
    doc.text(`${ivaImport.toFixed(2)} €`, width - margin, finalY + 16, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.text("Total:", width - margin - 100, finalY + 32);
    doc.text(`${total.toFixed(2)} €`, width - margin, finalY + 32, {
      align: "right",
    });

    // Comentarios e IBAN
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Comentarios: ${comentarios || "Pago por transferencia"}`,
      margin,
      finalY + 60
    );
    doc.text(`IBAN: ${iban || "ESXXXXXXXXXXXXXXX9"}`, margin, finalY + 76);

    // Guardar
    doc.save("factura-electronica.pdf");
  };

  // Enviar a AEAT
  const enviarAEAT = async () => {
    try {
      await axios.post("/api/factura-electronica", {
        emiNombre,
        emiDireccion,
        emiCP,
        emiCiudad,
        emiNIF,
        emiEmail,
        recNombre,
        recDireccion,
        recCP,
        recCiudad,
        recNIF,
        recEmail,
        lineas,
        vat,
        comentarios,
        iban,
      });
      alert("Factura enviada a la AEAT correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error al enviar a la AEAT.");
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        {/* EMISOR / RECEPTOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Nombre Emisor"
            value={emiNombre}
            onChange={(e) => setEmiNombre(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Nombre Receptor"
            value={recNombre}
            onChange={(e) => setRecNombre(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="Dirección Emisor"
            value={emiDireccion}
            onChange={(e) => setEmiDireccion(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Dirección Receptor"
            value={recDireccion}
            onChange={(e) => setRecDireccion(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="CP Emisor"
            value={emiCP}
            onChange={(e) => setEmiCP(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="CP Receptor"
            value={recCP}
            onChange={(e) => setRecCP(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="Ciudad Emisor"
            value={emiCiudad}
            onChange={(e) => setEmiCiudad(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Ciudad Receptor"
            value={recCiudad}
            onChange={(e) => setRecCiudad(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="NIF Emisor"
            value={emiNIF}
            onChange={(e) => setEmiNIF(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="NIF Receptor"
            value={recNIF}
            onChange={(e) => setRecNIF(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="Email Emisor"
            value={emiEmail}
            onChange={(e) => setEmiEmail(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Email Receptor"
            value={recEmail}
            onChange={(e) => setRecEmail(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* LÍNEAS */}
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
          className="text-indigo-600 hover:underline"
        >
          + Añadir línea
        </button>

        {/* IVA, comentarios, IBAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              min={0}
              value={vat}
              onChange={(e) => setVat(+e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <input
            placeholder="Comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="border rounded px-3 py-2 col-span-2"
          />
          <input
            placeholder="IBAN"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="border rounded px-3 py-2 col-span-2"
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-100 p-4 rounded text-right space-y-1">
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
