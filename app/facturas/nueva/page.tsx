// app/facturas/page.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { jsPDF } from "jspdf";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function FacturasPage() {
  // Cabecera factura
  const [fecha, setFecha] = useState("");
  const [numero, setNumero] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [serie, setSerie] = useState("A");

  // Datos de emisor (tú)
  const [emisor, setEmisor] = useState({
    nombre: "DECLARANDO SL",
    direccion: "",
    nif: "",
    cp: "",
    email: "",
  });
  // Datos de receptor (cliente)
  const [receptor, setReceptor] = useState({
    nombre: "",
    direccion: "",
    cif: "",
    cp: "",
    email: "",
  });

  // Líneas de factura
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);

  // Tipos de impuesto
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);

  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLineas((L) =>
      L.map((l, idx) =>
        idx === i
          ? {
              ...l,
              [name]:
                name === "descripcion" ? value : parseFloat(value) || 0,
            }
          : l
      )
    );
  };

  const addLinea = () => {
    setLineas((L) => [...L, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  };

  const calcularTotales = () => {
    const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
    const ivaImp = (base * iva) / 100;
    const irpfImp = (base * irpf) / 100;
    const total = base + ivaImp - irpfImp;
    return { base, ivaImp, irpfImp, total };
  };

  const exportCSV = () => {
    const { base, ivaImp, irpfImp, total } = calcularTotales();
    const header = [
      "Serie",
      "Número",
      "Fecha",
      "Vencimiento",
      "Emisor",
      "Receptor",
      "Descripción",
      "Unidades",
      "Precio Unitario",
      "Importe",
    ];
    const rows = lineas.map((l) => [
      serie,
      numero,
      fecha,
      vencimiento,
      emisor.nombre,
      receptor.nombre,
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);
    rows.push(["", "", "", "", "", "", "BASE IMPONIBLE", "", "", base.toFixed(2)]);
    rows.push(["", "", "", "", "", "", `IVA (${iva}%)`, "", "", ivaImp.toFixed(2)]);
    rows.push(["", "", "", "", "", "", `IRPF (${irpf}%)`, "", "", (-irpfImp).toFixed(2)]);
    rows.push(["", "", "", "", "", "", "TOTAL", "", "", total.toFixed(2)]);

    const csv =
      [header, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        )
        .join("\r\n") +
      "\r\n\nCondiciones de pago: 30 días netos. Pago por transferencia.";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-${serie}${numero || "NN"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204);
    doc.text("Factura", 40, y);
    y += 30;

    // Cabecera factura
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Serie: ${serie}`, 40, y);
    doc.text(`Número: ${numero}`, 200, y);
    doc.text(`Fecha: ${fecha}`, 360, y);
    y += 16;
    doc.text(`Vencimiento: ${vencimiento}`, 40, y);
    y += 30;

    // Emisor / Receptor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Emisor", 40, y);
    doc.text("Receptor", 300, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Nombre: ${emisor.nombre}`, 40, y);
    doc.text(`Nombre: ${receptor.nombre}`, 300, y);
    y += 14;
    doc.text(`Dirección: ${emisor.direccion}`, 40, y);
    doc.text(`Dirección: ${receptor.direccion}`, 300, y);
    y += 14;
    doc.text(`NIF: ${emisor.nif}`, 40, y);
    doc.text(`CIF: ${receptor.cif}`, 300, y);
    y += 14;
    doc.text(`CP y ciudad: ${emisor.cp}`, 40, y);
    doc.text(`CP y ciudad: ${receptor.cp}`, 300, y);
    y += 14;
    doc.text(`Email: ${emisor.email}`, 40, y);
    doc.text(`Email: ${receptor.email}`, 300, y);
    y += 30;

    // Encabezado tabla
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    const cols = ["Descripción", "Unidades", "Precio U. (€)", "Importe (€)"];
    cols.forEach((h, i) => doc.text(h, 40 + i * 130, y));
    y += 16;
    doc.setLineWidth(0.5);
    doc.line(40, y, 550, y);
    y += 10;

    // Filas
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y);
      doc.text(l.unidades.toString(), 170, y, { align: "right" });
      doc.text(l.precioUnitario.toFixed(2), 300, y, { align: "right" });
      doc.text((l.unidades * l.precioUnitario).toFixed(2), 430, y, {
        align: "right",
      });
      y += 18;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    // Totales
    const { base, ivaImp, irpfImp, total } = calcularTotales();
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text("BASE IMPONIBLE:", 300, y);
    doc.text(base.toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.text(`IVA (${iva}%):`, 300, y);
    doc.text(ivaImp.toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.text(`IRPF (${irpf}%):`, 300, y);
    doc.text((-irpfImp).toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.setFontSize(16).setTextColor(0, 0, 0);
    doc.text("TOTAL:", 300, y);
    doc.text(total.toFixed(2) + " €", 550, y, { align: "right" });
    y += 30;

    doc.setFontSize(10).setTextColor(60, 60, 60);
    doc.text("Condiciones de pago: 30 días netos.", 40, y);
    y += 14;
    doc.text("Pago por transferencia: ESXXXXXXXXXXXXXXX9", 40, y);

    doc.save(`factura-${serie}${numero}.pdf`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-gray-50">
      <h1 className="text-2xl font-bold">Nueva Factura</h1>
      <form className="bg-white p-6 rounded shadow space-y-4">
        {/* Serie/Número/Fechas */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm">Serie</label>
            <input
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Número</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Emisor / Receptor */}
        <div className="grid grid-cols-2 gap-4">
          <fieldset>
            <legend className="font-semibold">Emisor</legend>
            <input
              placeholder="Dirección"
              onChange={(e) =>
                setEmisor({ ...emisor, direccion: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="NIF"
              onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="CP y ciudad"
              onChange={(e) => setEmisor({ ...emisor, cp: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="Email"
              onChange={(e) =>
                setEmisor({ ...emisor, email: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </fieldset>
          <fieldset>
            <legend className="font-semibold">Receptor</legend>
            <input
              placeholder="Nombre"
              onChange={(e) =>
                setReceptor({ ...receptor, nombre: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="Dirección"
              onChange={(e) =>
                setReceptor({ ...receptor, direccion: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="CIF"
              onChange={(e) =>
                setReceptor({ ...receptor, cif: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="CP y ciudad"
              onChange={(e) =>
                setReceptor({ ...receptor, cp: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="Email"
              onChange={(e) =>
                setReceptor({ ...receptor, email: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </fieldset>
        </div>

        {/* Líneas */}
        <fieldset className="space-y-2">
          <legend className="font-semibold">Conceptos</legend>
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <input
                name="descripcion"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                name="unidades"
                placeholder="Unidades"
                value={l.unidades}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-2 py-1"
              />
              <input
                type="number"
                name="precioUnitario"
                placeholder="Precio unitario"
                step="0.01"
                value={l.precioUnitario}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-2 py-1"
              />
              <div className="flex items-center">
                <span className="mr-2">
                  {(l.unidades * l.precioUnitario).toFixed(2)} €
                </span>
                {i === lineas.length - 1 && (
                  <button
                    type="button"
                    onClick={addLinea}
                    className="px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </fieldset>

        {/* Impuestos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              value={iva}
              onChange={(e) => setIva(+e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input
              type="number"
              value={irpf}
              onChange={(e) => setIrpf(+e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Botones exportar */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Descargar PDF
          </button>
        </div>
      </form>
    </div>
  );
}
