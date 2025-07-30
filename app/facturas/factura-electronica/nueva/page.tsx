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

  // Estado principal
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

  // Cálculos
  const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  // Añadir / quitar líneas
  const addLinea = () =>
    setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const removeLinea = (i: number) =>
    setLineas(lineas.filter((_, idx) => idx !== i));

  // Exportar CSV
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
    // Totales
    rows.push([]);
    rows.push(["Base imponible:", "", "", base.toFixed(2)]);
    rows.push([`IVA (${vat}%):`, "", "", ivaImport.toFixed(2)]);
    rows.push(["Total:", "", "", total.toFixed(2)]);
    // Comentarios + IBAN
    rows.push([]);
    rows.push([`Comentarios: ${comentarios}`, "", "", ""]);
    rows.push([`IBAN: ${iban}`, "", "", ""]);

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

  // Exportar PDF
  const exportPDF = async () => {
    if (!contRef.current) return;
    // Generamos un canvas para el header
    const canvas = await html2canvas(contRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(imgData, "PNG", 0, 0, pageWidth, (canvas.height * pageWidth) / canvas.width);

    // Tablas
    const y = canvas.height * (pageWidth / canvas.width) + 20;
    autoTable(doc, {
      startY: y,
      head: [
        ["Descripción", "Unidades", "Precio Unit. (€)", "Precio (€)"],
      ],
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

    // Totales & Comentarios
    const finalY = doc.lastAutoTable.finalY! + 20;
    doc.setFontSize(10);
    doc.text(`Base imponible: ${base.toFixed(2)} €`, pageWidth - 150, finalY);
    doc.text(`IVA (${vat}%): ${ivaImport.toFixed(2)} €`, pageWidth - 150, finalY + 15);
    doc.setFontSize(12).text(`Total: ${total.toFixed(2)} €`, pageWidth - 150, finalY + 35);

    doc.setFontSize(10).text(
      `Comentarios: ${comentarios}   IBAN: ${iban}`,
      40,
      finalY + 60
    );

    doc.save(`factura-${receptor.nombre}.pdf`);
  };

  // Descargar XML Facturae
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
      invoiceDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
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

  // Enviar a AEAT (SOAP)
  const enviarAEAT = async () => {
    try {
      const xml = buildFacturaeXML({
        /* mismos datos que generarFacturae */
      });
      await axios.post("/api/factura-electronica", { xml });
      alert("Enviada correctamente a AEAT");
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
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="font-semibold">Emisor</h2>
            <input
              placeholder="Nombre"
              value={emisor.nombre}
              onChange={(e) =>
                setEmisor({ ...emisor, nombre: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="NIF"
              value={emisor.nif}
              onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="Dirección"
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
            <div className="flex gap-2">
              <input
                placeholder="Teléfono"
                value={emisor.telefono}
                onChange={(e) =>
                  setEmisor({ ...emisor, telefono: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
              <input
                placeholder="Email"
                value={emisor.email}
                onChange={(e) =>
                  setEmisor({ ...emisor, email: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold">Receptor</h2>
            <input
              placeholder="Nombre"
              value={receptor.nombre}
              onChange={(e) =>
                setReceptor({ ...receptor, nombre: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="NIF"
              value={receptor.nif}
              onChange={(e) =>
                setReceptor({ ...receptor, nif: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="Dirección"
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
            <div className="flex gap-2">
              <input
                placeholder="Teléfono"
                value={receptor.telefono}
                onChange={(e) =>
                  setReceptor({ ...receptor, telefono: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
              <input
                placeholder="Email"
                value={receptor.email}
                onChange={(e) =>
                  setReceptor({ ...receptor, email: e.target.value })
                }
                className="w-1/2 border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* LÍNEAS */}
        <div className="space-y-4">
          <h2 className="font-semibold">Conceptos</h2>
          {lineas.map((l, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => {
                  const copy = [...lineas];
                  copy[i].descripcion = e.target.value;
                  setLineas(copy);
                }}
                className="flex-1 border rounded px-3 py-2"
              />
              <input
                type="number"
                className="w-16 border rounded px-2 py-2"
                value={l.unidades}
                onChange={(e) => {
                  const copy = [...lineas];
                  copy[i].unidades = +e.target.value;
                  setLineas(copy);
                }}
              />
              <input
                type="number"
                className="w-24 border rounded px-2 py-2"
                value={l.precioUnitario}
                onChange={(e) => {
                  const copy = [...lineas];
                  copy[i].precioUnitario = +e.target.value;
                  setLineas(copy);
                }}
              />
              <button
                onClick={() => removeLinea(i)}
                className="text-white bg-red-500 px-2 rounded"
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
        </div>

        {/* IVA, comentarios e IBAN */}
        <div className="grid grid-cols-2 gap-6 items-start">
          <div>
            <label className="block font-medium">IVA (%)</label>
            <input
              type="number"
              className="mt-1 w-24 border rounded px-2 py-2"
              value={vat}
              onChange={(e) => setVat(+e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium">Comentarios</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
            <label className="block font-medium">IBAN</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </div>
        </div>

        {/* Totales */}
        <div className="bg-gray-100 p-4 rounded flex justify-end space-x-8 text-right">
          <div>
            <div>Base imponible:</div>
            <div>IVA ({vat}%):</div>
            <div className="font-semibold">Total:</div>
          </div>
          <div>
            <div>{base.toFixed(2)} €</div>
            <div>{ivaImport.toFixed(2)} €</div>
            <div className="font-semibold">{total.toFixed(2)} €</div>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={exportCSV}
          className="px-6 py-2 border rounded hover:bg-gray-50"
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
          onClick={generarFacturae}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Generar Facturae
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
