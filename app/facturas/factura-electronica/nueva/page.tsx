"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { buildFacturaeXML, FacturaeData } from "@/lib/facturae";

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
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    doc.setFontSize(20);
    doc.text("FACTURA ELECTRÓNICA", W - 40, 40, { align: "right" });
    doc.setFontSize(10);

    let y = 60;
    doc.text(`Fecha de factura: ${new Date().toLocaleDateString()}`, 40, y);
    y += 14;
    doc.text(`Número de factura: 2024-0001`, 40, y);
    y += 14;
    doc.text(
      `Fecha de vencimiento: ${new Date(Date.now() + 86400000).toLocaleDateString()}`,
      40,
      y
    );

    y += 20;
    doc.line(40, y, W - 40, y);
    y += 20;

    // Emisor / Receptor
    doc.setFontSize(12);
    doc.text("Emisor:", 40, y);
    doc.text("Receptor:", W / 2 + 20, y);
    doc.setFontSize(10);
    y += 14;
    doc.text(emisor.nombre, 40, y);
    doc.text(receptor.nombre, W / 2 + 20, y);
    y += 14;
    doc.text(`Dirección: ${emisor.direccion}`, 40, y);
    doc.text(`Dirección: ${receptor.direccion}`, W / 2 + 20, y);
    y += 14;
    doc.text(`CP ${emisor.cp} · ${emisor.ciudad}`, 40, y);
    doc.text(`CP ${receptor.cp} · ${receptor.ciudad}`, W / 2 + 20, y);
    y += 14;
    doc.text(`NIF: ${emisor.nif}`, 40, y);
    doc.text(`NIF: ${receptor.nif}`, W / 2 + 20, y);
    y += 14;
    doc.text(`Tel: ${emisor.telefono}`, 40, y);
    doc.text(`Tel: ${receptor.telefono}`, W / 2 + 20, y);
    y += 14;
    doc.text(`Email: ${emisor.email}`, 40, y);
    doc.text(`Email: ${receptor.email}`, W / 2 + 20, y);

    y += 30;
    autoTable(doc, {
      startY: y,
      head: [["Descripción", "Unidades", "Precio Unit. (€)", "Precio (€)"]],
      body: lineas.map((l) => [
        l.descripcion,
        l.unidades,
        l.precioUnitario.toFixed(2),
        (l.unidades * l.precioUnitario).toFixed(2),
      ]),
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [230, 230, 230] },
      margin: { left: 40, right: 40 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text(`Base imponible:`, W - 200, finalY);
    doc.text(`${base.toFixed(2)} €`, W - 40, finalY, { align: "right" });
    doc.text(`IVA (${vat}%):`, W - 200, finalY + 14);
    doc.text(`${ivaImport.toFixed(2)} €`, W - 40, finalY + 14, { align: "right" });
    doc.setFontSize(14);
    doc.text(`Total:`, W - 200, finalY + 30);
    doc.text(`${total.toFixed(2)} €`, W - 40, finalY + 30, { align: "right" });

    let y2 = finalY + 60;
    doc.setFontSize(10);
    doc.text(`Comentarios: ${comentarios}`, 40, y2);
    doc.text(`IBAN: ${iban}`, 40, y2 + 14);

    doc.save("factura-electronica.pdf");
  };

  // === NUEVA FUNCIÓN: Envío a AEAT (Facturae) ===
  const enviarFacturae = async () => {
    // Mapea tu estado a la interfaz FacturaeData
    const data: FacturaeData = {
      issuerName: emisor.nombre,
      issuerNIF: emisor.nif,
      receiverName: receptor.nombre,
      receiverNIF: receptor.nif,
      issuerAddress: emisor.direccion,
      issuerPostalCode: emisor.cp,
      issuerCity: emisor.ciudad,
      issuerEmail: emisor.email,
      issuerPhone: emisor.telefono,
      receiverAddress: receptor.direccion,
      receiverPostalCode: receptor.cp,
      receiverCity: receptor.ciudad,
      receiverEmail: receptor.email,
      receiverPhone: receptor.telefono,
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "2024-0001",
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      lines: lineas.map((l) => ({
        description: l.descripcion,
        quantity: l.unidades,
        unitPrice: l.precioUnitario,
      })),
      taxRate: vat,
      comments: comentarios,
      IBAN: iban,
    };

    try {
      const xml = buildFacturaeXML(data);
      const resp = await axios.post("/api/factura-electronica", { xml });
      if (resp.data.success) {
        alert("Factura electrónica enviada correctamente.");
      } else {
        alert("Error al enviar factura: " + resp.data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error al enviar la factura electrónica.");
    }
  };

  return (
    <div className="py-8 px-4">
      <div
        ref={contRef}
        className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6"
      >
        {/* … aquí va todo el formulario igual que antes … */}
      </div>

      {/* Botones al pie */}
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
          onClick={enviarFacturae}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Enviar Facturae
        </button>
      </div>
    </div>
  );
}

