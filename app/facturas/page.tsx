// app/facturas/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import buildFacturaeXML, { FacturaeData } from "../../lib/facturae";
import { useRouter } from "next/navigation";

type LineaForm = {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
};

export default function FacturasPage() {
  const router = useRouter();
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState(0);
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [emisor, setEmisor] = useState({ nombre: "", nif: "", direccion: "", cp: "", ciudad: "" });
  const [receptor, setReceptor] = useState({ nombre: "", cif: "", direccion: "", cp: "", ciudad: "" });
  const [lineas, setLineas] = useState<LineaForm[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const agregarLinea = () =>
    setLineas((ls) => [...ls, { descripcion: "", unidades: 1, precioUnitario: 0 }]);

  const actualizarLinea = (i: number, campo: keyof LineaForm, valor: any) =>
    setLineas((ls) =>
      ls.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l))
    );

  const enviarVerifactu = async () => {
    setError(null);
    const data: FacturaeData = {
      serie,
      numero,
      fecha,
      vencimiento,
      emisor: {
        nombre: emisor.nombre,
        nif: emisor.nif,
        direccion: emisor.direccion,
        cp: emisor.cp,
        ciudad: emisor.ciudad,
      },
      receptor: {
        nombre: receptor.nombre,
        cif: receptor.cif,
        direccion: receptor.direccion,
        cp: receptor.cp,
        ciudad: receptor.ciudad,
      },
      lineas,
      iva,
      irpf,
    };

    const xml = buildFacturaeXML(data);

    try {
      const resp = await axios.post<{ pdfUrl: string }>(
        "https://api.verifactu.com/v1/invoices/upload",
        { xml },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERIFACTU_KEY!}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.open(resp.data.pdfUrl, "_blank");
    } catch (err: any) {
      console.error("Verifactu error:", err);
      // intenta extraer el mensaje de error de la respuesta
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error desconocido";
      setError(msg);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Crear factura</h1>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-100 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Serie"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(+e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={vencimiento}
          onChange={(e) => setVencimiento(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Emisor</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Nombre"
            value={emisor.nombre}
            onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="NIF"
            value={emisor.nif}
            onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="Dirección"
            value={emisor.direccion}
            onChange={(e) => setEmisor({ ...emisor, direccion: e.target.value })}
            className="col-span-2 border px-3 py-2 rounded"
          />
          <input
            placeholder="CP"
            value={emisor.cp}
            onChange={(e) => setEmisor({ ...emisor, cp: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="Ciudad"
            value={emisor.ciudad}
            onChange={(e) => setEmisor({ ...emisor, ciudad: e.target.value })}
            className="border px-3 py-2 rounded"
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Receptor</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Nombre"
            value={receptor.nombre}
            onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="CIF"
            value={receptor.cif}
            onChange={(e) => setReceptor({ ...receptor, cif: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="Dirección"
            value={receptor.direccion}
            onChange={(e) => setReceptor({ ...receptor, direccion: e.target.value })}
            className="col-span-2 border px-3 py-2 rounded"
          />
          <input
            placeholder="CP"
            value={receptor.cp}
            onChange={(e) => setReceptor({ ...receptor, cp: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            placeholder="Ciudad"
            value={receptor.ciudad}
            onChange={(e) => setReceptor({ ...receptor, ciudad: e.target.value })}
            className="border px-3 py-2 rounded"
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Líneas</h2>
        {lineas.map((l, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 mb-2">
            <input
              placeholder="Descripción"
              value={l.descripcion}
              onChange={(e) => actualizarLinea(i, "descripcion", e.target.value)}
              className="col-span-2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Unidades"
              value={l.unidades}
              onChange={(e) => actualizarLinea(i, "unidades", +e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Precio unitario"
              value={l.precioUnitario}
              onChange={(e) => actualizarLinea(i, "precioUnitario", +e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={agregarLinea}
          className="text-sm text-blue-600 hover:underline"
        >
          + Añadir línea
        </button>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="number"
          placeholder="IVA (%)"
          value={iva}
          onChange={(e) => setIva(+e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="IRPF (%)"
          value={irpf}
          onChange={(e) => setIrpf(+e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={enviarVerifactu}
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Enviar a Verifactu
      </button>
    </main>
  );
}
