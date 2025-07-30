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

  // Exportar CSV
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

  // Exportar PDF
  const exportPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.text("FACTURA", W - 80, 40, { align: "right" });

    // Fechas y número
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
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [230, 230, 230] },
      margin: { left: 40, right: 40 },
    });

    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text(`Base imponible:`, W - 200, finalY);
    doc.text(`${base.toFixed(2)} €`, W - 80, finalY, { align: "right" });
    doc.text(`IVA (${vat}%):`, W - 200, finalY + 14);
    doc.text(`${ivaImport.toFixed(2)} €`, W - 80, finalY + 14, { align: "right" });
    doc.setFontSize(14);
    doc.text(`Total:`, W - 200, finalY + 30);
    doc.text(`${total.toFixed(2)} €`, W - 80, finalY + 30, { align: "right" });

    // Comentarios y IBAN
    let y2 = finalY + 60;
    doc.setFontSize(10);
    doc.text(`Comentarios: ${comentarios}`, 40, y2);
    doc.text(`IBAN: ${iban}`, 40, y2 + 14);

    doc.save("factura-electronica.pdf");
  };

  // Enviar factura a AEAT
  const enviarFacturae = async () => {
    try {
      const invoiceData = {
        issuerName: emisor.nombre,
        issuerNIF: emisor.nif,
        issuerAddress: emisor.direccion,
        issuerCity: emisor.ciudad,
        issuerPostalCode: emisor.cp,
        issuerPhone: emisor.telefono,
        issuerEmail: emisor.email,
        receiverName: receptor.nombre,
        receiverNIF: receptor.nif,
        receiverAddress: receptor.direccion,
        receiverCity: receptor.ciudad,
        receiverPostalCode: receptor.cp,
        receiverPhone: receptor.telefono,
        receiverEmail: receptor.email,
        invoiceNumber: "2024-0001",
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        lines: lineas.map((l) => ({
          description: l.descripcion,
          quantity: l.unidades,
          unitPrice: l.precioUnitario,
        })),
        VATRate: vat,
        comments: comentarios,
        IBAN: iban,
      };

      const res = await fetch("/api/factura-electronica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      const json = await res.json();
      if (json.success) {
        alert("Factura electrónica enviada correctamente a la AEAT.");
      } else {
        alert("Error al enviar a la AEAT: " + json.error);
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
        <h1 className="text-2xl font-bold">Nueva Factura Electrónica</h1>

        {/* Emisor / Receptor */}
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
          onClick={enviarFacturae}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Enviar a AEAT
        </button>
      </div>
    </div>
  );
}
