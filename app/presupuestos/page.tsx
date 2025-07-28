// app/presupuestos/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { jsPDF } from "jspdf";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function PresupuestosPage() {
  const [fecha, setFecha] = useState("");
  const [numero, setNumero] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [empresa, setEmpresa] = useState({
    nombre: "DECLARANDO",
    direccion: "",
    nif: "",
    cp: "",
    email: "",
  });
  const [cliente, setCliente] = useState({
    nombre: "",
    direccion: "",
    cif: "",
    cp: "",
    email: "",
  });
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);

  function handleLineaChange(i: number, e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setLineas((L) =>
      L.map((l, idx) =>
        idx === i
          ? {
              ...l,
              [name]:
                name === "descripcion"
                  ? value
                  : Number(value),
            }
          : l
      )
    );
  }

  function addLinea() {
    setLineas((L) => [...L, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  }

  function calcularTotales() {
    const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
    const ivaImp = (base * iva) / 100;
    const irpfImp = (base * irpf) / 100;
    const total = base + ivaImp - irpfImp;
    return { base, ivaImp, irpfImp, total };
  }

  function exportCSV() {
    const { base, ivaImp, irpfImp, total } = calcularTotales();
    const header = [
      "Fecha",
      "Número",
      "Vencimiento",
      "Empresa",
      "Cliene",
      "Descripción",
      "Unidades",
      "Precio Unitario",
      "Importe",
    ];
    const rows = lineas.map((l) => [
      fecha,
      numero,
      vencimiento,
      empresa.nombre,
      cliente.nombre,
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);
    // totales al final
    rows.push([
      "",
      "",
      "",
      "",
      "",
      "BASE IMPONIBLE",
      "",
      "",
      base.toFixed(2),
    ]);
    rows.push(["", "", "", "", "", `IVA (${iva}%)`, "", "", ivaImp.toFixed(2)]);
    rows.push(["", "", "", "", "", `IRPF (${irpf}%)`, "", "", (-irpfImp).toFixed(2)]);
    rows.push(["", "", "", "", "", "TOTAL", "", "", total.toFixed(2)]);

    const csv =
      [header, ...rows]
        .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
        .join("\r\n") + "\r\n\n" +
      `Condiciones de pago: 30 días. Pago por transferencia: ESXXXXXXXXXXXXXXX`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presupuesto-${numero || "sin-numero"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    doc.setFontSize(20);
    doc.text("Presupuesto", 40, y);
    y += 30;

    doc.setFontSize(12);
    doc.text(`Fecha de presupuesto: ${fecha}`, 40, y);
    y += 16;
    doc.text(`Número de presupuesto: ${numero}`, 40, y);
    y += 16;
    doc.text(`Fecha de vencimiento: ${vencimiento}`, 40, y);
    y += 30;

    // Cabecera empresa/cliente
    doc.setFontSize(14);
    doc.text(empresa.nombre, 40, y);
    doc.text(cliente.nombre || "Cliente", 300, y);
    y += 16;
    doc.setFontSize(10);
    doc.text(`Dirección: ${empresa.direccion}`, 40, y);
    doc.text(`Dirección: ${cliente.direccion}`, 300, y);
    y += 14;
    doc.text(`NIF: ${empresa.nif}`, 40, y);
    doc.text(`CIF: ${cliente.cif}`, 300, y);
    y += 14;
    doc.text(`CP y ciudad: ${empresa.cp}`, 40, y);
    doc.text(`CP y ciudad: ${cliente.cp}`, 300, y);
    y += 14;
    doc.text(`Email: ${empresa.email}`, 40, y);
    doc.text(`Email: ${cliente.email}`, 300, y);
    y += 30;

    // Tabla lineas
    doc.setFontSize(12);
    const cols = ["Descripción", "Unidades", "Precio Unitario (€)", "Precio (€)"];
    cols.forEach((h, i) => doc.text(h, 40 + i * 130, y));
    y += 16;
    doc.setLineWidth(0.5);
    doc.line(40, y, 550, y);
    y += 10;

    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y);
      doc.text(l.unidades.toString(), 40 + 130, y, { align: "right" });
      doc.text(l.precioUnitario.toFixed(2), 40 + 260, y, { align: "right" });
      doc.text((l.unidades * l.precioUnitario).toFixed(2), 40 + 390, y, {
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
    doc.setFontSize(12).setTextColor("#1565C0");
    doc.text("BASE IMPONIBLE:", 300, y);
    doc.text(base.toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.text(`IVA (${iva}%):`, 300, y);
    doc.text(ivaImp.toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.text(`IRPF (${irpf}%):`, 300, y);
    doc.text((-irpfImp).toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.setFontSize(14).setTextColor("#000");
    doc.text("TOTAL:", 300, y);
    doc.text(total.toFixed(2) + " €", 550, y, { align: "right" });
    y += 30;

    // Comentarios
    doc.setFontSize(10);
    doc.text(
      "Condiciones de pago: 30 días a partir de la fecha de entrega de los artículos.",
      40,
      y
    );
    y += 14;
    doc.text(
      "Pago por transferencia: ESXXXXXXXXXXXXXXX9",
      40,
      y
    );

    doc.save(`presupuesto-${numero || "sin-numero"}.pdf`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-50">
      <h1 className="text-2xl font-bold">Crear Presupuesto</h1>

      <form className="bg-white p-6 rounded shadow space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm">Fecha de presupuesto</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Número de presupuesto</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">Fecha de vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <fieldset>
            <legend className="font-semibold">Tus datos</legend>
            <input
              placeholder="Dirección"
              onChange={(e) =>
                setEmpresa({ ...empresa, direccion: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="NIF"
              onChange={(e) => setEmpresa({ ...empresa, nif: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="CP y ciudad"
              onChange={(e) => setEmpresa({ ...empresa, cp: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="Email"
              onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </fieldset>
          <fieldset>
            <legend className="font-semibold">Datos del cliente</legend>
            <input
              placeholder="Nombre / razón social"
              onChange={(e) =>
                setCliente({ ...cliente, nombre: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="Dirección"
              onChange={(e) =>
                setCliente({ ...cliente, direccion: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="CIF"
              onChange={(e) => setCliente({ ...cliente, cif: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="CP y ciudad"
              onChange={(e) => setCliente({ ...cliente, cp: e.target.value })}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <input
              placeholder="Email"
              onChange={(e) =>
                setCliente({ ...cliente, email: e.target.value })
              }
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </fieldset>
        </div>

        <fieldset className="space-y-2">
          <legend className="font-semibold">Líneas del presupuesto</legend>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              value={iva}
              onChange={(e) => setIva(Number(e.target.value))}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input
              type="number"
              value={irpf}
              onChange={(e) => setIrpf(Number(e.target.value))}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
        </div>

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
