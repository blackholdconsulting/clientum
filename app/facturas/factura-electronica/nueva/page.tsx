"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { buildFacturaeXML, InvoiceData } from "@/lib/facturae";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaElectronicaPage() {
  const router = useRouter();
  const contRef = useRef<HTMLDivElement>(null);

  const [emisor, setEmisor] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    cp: "",
    ciudad: "",
    telefono: "",
    email: "",
  });
  const [receptor, setReceptor] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    cp: "",
    ciudad: "",
    telefono: "",
    email: "",
  });
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [vat, setVat] = useState(21);
  const [comentarios, setComentarios] = useState("");
  const [iban, setIban] = useState("");

  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

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
    rows.push([]);
    rows.push(["Base imponible:", base.toFixed(2) + " €"]);
    rows.push([`IVA (${vat}%):`, ivaImport.toFixed(2) + " €"]);
    rows.push(["Total:", total.toFixed(2) + " €"]);
    rows.push([]);
    rows.push([`Comentarios: ${comentarios}`]);
    rows.push([`IBAN: ${iban}`]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${c}"`).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `factura-${receptor.nombre}.csv`;
    link.click();
  };

  const exportPDF = async () => {
    if (!contRef.current) return;
    const canvas = await html2canvas(contRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(
      imgData,
      "PNG",
      0,
      0,
      pageWidth,
      (canvas.height * pageWidth) / canvas.width
    );

    const startY = (canvas.height * pageWidth) / canvas.width + 20;
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
      headStyles: { fillColor: "#f5f5f5" },
      margin: { left: 40, right: 40 },
    });

    // Ajuste: usamos (doc as any).lastAutoTable
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text(`Base imponible: ${base.toFixed(2)} €`, pageWidth - 150, finalY);
    doc.text(
      `IVA (${vat}%): ${ivaImport.toFixed(2)} €`,
      pageWidth - 150,
      finalY + 15
    );
    doc.setFontSize(12).text(`Total: ${total.toFixed(2)} €`, pageWidth - 150, finalY + 35);

    doc.setFontSize(10).text(
      `Comentarios: ${comentarios}   IBAN: ${iban}`,
      40,
      finalY + 60
    );

    doc.save(`factura-${receptor.nombre}.pdf`);
  };

  const generarFacturae = () => {
    const data: InvoiceData = {
      issuerName: emisor.nombre,
      issuerNIF: emisor.nif,
      issuerAddress: emisor.direccion,
      issuerPostalCode: emisor.cp,
      issuerCity: emisor.ciudad,
      issuerPhone: emisor.telefono,
      issuerEmail: emisor.email,
      receiverName: receptor.nombre,
      receiverNIF: receptor.nif,
      receiverAddress: receptor.direccion,
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

    const xml = buildFacturaeXML(data);
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturae-${data.invoiceNumber}.xml`;
    a.click();
  };

  const enviarAEAT = async () => {
    try {
      const xml = buildFacturaeXML({
        /* igual que generarFacturae */
      } as any);
      await axios.post("/api/factura-electronica", { xml });
      alert("Enviada a AEAT");
    } catch (e) {
      console.error(e);
      alert("Error al enviar a AEAT");
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
        {/* ... igual que antes ... */}
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <button onClick={exportCSV} className="px-6 py-2 border rounded">
          Exportar CSV
        </button>
        <button onClick={exportPDF} className="px-6 py-2 bg-indigo-600 text-white rounded">
          Exportar PDF
        </button>
        <button onClick={generarFacturae} className="px-6 py-2 bg-purple-600 text-white rounded">
          Generar Facturae
        </button>
        <button onClick={enviarAEAT} className="px-6 py-2 bg-green-600 text-white rounded">
          Enviar a AEAT
        </button>
      </div>
    </div>
  );
}
