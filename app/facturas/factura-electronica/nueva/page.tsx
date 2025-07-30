"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { buildFacturaeXML, InvoiceData } from "@/lib/facturae";

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
    telefono: "",
  });
  const [receptor, setReceptor] = useState({
    nombre: "",
    direccion: "",
    cp: "",
    ciudad: "",
    nif: "",
    email: "",
    telefono: "",
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

  // CSV
  const exportCSV = () => {
    const headers = ["Descripción", "Unidades", "Precio Unit. (€)", "Precio (€)"];
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

  // PDF
  const exportPDF = async () => {
    if (!contRef.current) return;
    const canvas = await html2canvas(contRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    doc.addImage(imgData, "PNG", 0, 0, W, (canvas.height * W) / canvas.width);

    const startY = (canvas.height * W) / canvas.width + 20;
    autoTable(doc, {
      startY,
      head: [["Descripción", "Unidades", "Precio Unit. (€)", "Precio (€)"]],
      body: lineas.map((l) => [
        l.descripcion,
        l.unidades.toString(),
        l.precioUnitario.toFixed(2),
        (l.unidades * l.precioUnitario).toFixed(2),
      ]),
      theme: "grid",
      headStyles: { fillColor: [230, 230, 230] },
      margin: { left: 40, right: 40 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text(`Base imponible: ${base.toFixed(2)} €`, W - 150, finalY);
    doc.text(`IVA (${vat}%): ${ivaImport.toFixed(2)} €`, W - 150, finalY + 15);
    doc.setFontSize(14).text(`Total: ${total.toFixed(2)} €`, W - 150, finalY + 35);

    doc.setFontSize(10).text(`Comentarios: ${comentarios}`, 40, finalY + 60);
    doc.text(`IBAN: ${iban}`, 40, finalY + 75);

    doc.save("factura-electronica.pdf");
  };

  // Enviar Facturae a AEAT
  const enviarAEAT = async () => {
    const invoiceData: InvoiceData = {
      issuerName: emisor.nombre,
      issuerNIF: emisor.nif,                // CORRECCIÓN A issuerNIF
      issuerPostalCode: emisor.cp,
      issuerCity: emisor.ciudad,
      issuerPhone: emisor.telefono,
      issuerEmail: emisor.email,

      receiverName: receptor.nombre,
      receiverNIF: receptor.nif,            // CORRECCIÓN A receiverNIF
      receiverPostalCode: receptor.cp,
      receiverCity: receptor.ciudad,
      receiverPhone: receptor.telefono,
      receiverEmail: receptor.email,

      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "2024-0001",
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],

      lines: lineas.map((l) => ({
        description: l.descripcion,
        quantity: l.unidades,
        unitPrice: l.precioUnitario,
      })),
      vatRate: vat,

      paymentComments: comentarios,
      paymentIBAN: iban,
    };

    const xml = buildFacturaeXML(invoiceData);
    const res = await fetch("/api/factura-electronica", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml }),
    });
    if (res.ok) {
      alert("Factura enviada a AEAT");
    } else {
      const err = await res.json();
      alert("Error al enviar: " + err.error);
    }
  };

  return (
    <div className="py-8 px-4">
      <div
        ref={contRef}
        className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        {/* EMISOR / RECEPTOR */}
        {/* …mantén el layout que ya tienes… */}
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
