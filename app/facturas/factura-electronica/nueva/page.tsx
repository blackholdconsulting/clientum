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
      issuerNif: emisor.nif,
      issuerPostalCode: emisor.cp,
      receiverName: receptor.nombre,
      receiverNif: receptor.nif,
      receiverPostalCode: receptor.cp,
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
        <div className="grid grid-cols-2 gap-6">
          {/* EMISOR */}
          <div className="space-y-2">
            <label>Nombre Emisor</label>
            <input
              value={emisor.nombre}
              onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <label>Dirección</label>
            <input
              value={emisor.direccion}
              onChange={(e) =>
                setEmisor({ ...emisor, direccion: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <input
                placeholder="CP"
                value={emisor.cp}
                onChange={(e) => setEmisor({ ...emisor, cp: e.target.value })}
                className="w-1/2 border rounded px-3 py-2"
              />
              <input
                placeholder="Ciudad"
                value={emisor.ciudad}
                onChange={(e) =>
                  setEmisor({ ...emisor, ciudad: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
            </div>
            <label>NIF</label>
            <input
              value={emisor.nif}
              onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <label>Teléfono</label>
            <input
              value={emisor.telefono}
              onChange={(e) =>
                setEmisor({ ...emisor, telefono: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <label>Email</label>
            <input
              type="email"
              value={emisor.email}
              onChange={(e) => setEmisor({ ...emisor, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* RECEPTOR */}
          <div className="space-y-2">
            <label>Nombre Receptor</label>
            <input
              value={receptor.nombre}
              onChange={(e) =>
                setReceptor({ ...receptor, nombre: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <label>Dirección</label>
            <input
              value={receptor.direccion}
              onChange={(e) =>
                setReceptor({ ...receptor, direccion: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <input
                placeholder="CP"
                value={receptor.cp}
                onChange={(e) =>
                  setReceptor({ ...receptor, cp: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
              <input
                placeholder="Ciudad"
                value={receptor.ciudad}
                onChange={(e) =>
                  setReceptor({ ...receptor, ciudad: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
            </div>
            <label>NIF</label>
            <input
              value={receptor.nif}
              onChange={(e) => setReceptor({ ...receptor, nif: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <label>Teléfono</label>
            <input
              value={receptor.telefono}
              onChange={(e) =>
                setReceptor({ ...receptor, telefono: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <label>Email</label>
            <input
              type="email"
              value={receptor.email}
              onChange={(e) =>
                setReceptor({ ...receptor, email: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Líneas */}
        <div>
          <h2 className="font-semibold mb-2">Conceptos</h2>
          {lineas.map((l, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
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
                value={l.unidades}
                onChange={(e) => {
                  const arr = [...lineas];
                  arr[i].unidades = +e.target.value;
                  setLineas(arr);
                }}
                className="w-20 border rounded px-2 py-2 text-center"
              />
              <input
                type="number"
                value={l.precioUnitario}
                onChange={(e) => {
                  const arr = [...lineas];
                  arr[i].precioUnitario = +e.target.value;
                  setLineas(arr);
                }}
                className="w-24 border rounded px-2 py-2 text-center"
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
            value={vat}
            onChange={(e) => setVat(+e.target.value)}
            className="w-24 border rounded px-2 py-2 ml-2"
          />
        </div>

        {/* Totales */}
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

        {/* Comentarios e IBAN */}
        <div className="space-y-2">
          <label>Comentarios</label>
          <input
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <label>IBAN</label>
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
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
