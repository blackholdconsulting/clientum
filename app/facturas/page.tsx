"use client";

import { useState } from "react";
import axios from "axios";
import { buildFacturaeXML, FacturaeData } from "../../lib/facturae";
import { useRouter } from "next/navigation";

type LineaForm = {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
};

export default function FacturasPage() {
  const router = useRouter();

  // Estados del formulario
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [emisor, setEmisor] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    cp: "",
    ciudad: "",
  });
  const [receptor, setReceptor] = useState({
    nombre: "",
    cif: "",
    direccion: "",
    cp: "",
    ciudad: "",
  });
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);

  const enviarVerifactu = async () => {
    try {
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
      const resp = await axios.post<{ pdfUrl: string }>(
        "https://api.verifactu.com/v1/invoices/upload",
        { xml },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERIFACTU_KEY}`,
          },
        }
      );
      window.open(resp.data.pdfUrl, "_blank");
    } catch (err) {
      alert("No se pudo generar la factura en Verifactu.");
      console.error(err);
    }
  };

  const enviarFacturae = async () => {
    try {
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
      // aquí enviarías `xml` a Facturae o guardarlo en tu base de datos
      console.log("XML Facturae:", xml);
      alert("Facturae generada correctamente (simulación).");
    } catch (err) {
      alert("Error generando Facturae.");
      console.error(err);
    }
  };

  // Renderizado del formulario
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Crear Factura</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Serie"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          placeholder="Número"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={vencimiento}
          onChange={(e) => setVencimiento(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Emisor */}
      <h2 className="text-xl font-semibold mb-2">Emisor</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Nombre"
          value={emisor.nombre}
          onChange={(e) => setEmisor({ ...emisor, nombre: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="NIF"
          value={emisor.nif}
          onChange={(e) => setEmisor({ ...emisor, nif: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Dirección"
          value={emisor.direccion}
          onChange={(e) =>
            setEmisor({ ...emisor, direccion: e.target.value })
          }
          className="border p-2 rounded col-span-2"
        />
        <input
          placeholder="CP"
          value={emisor.cp}
          onChange={(e) => setEmisor({ ...emisor, cp: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Ciudad"
          value={emisor.ciudad}
          onChange={(e) => setEmisor({ ...emisor, ciudad: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Receptor */}
      <h2 className="text-xl font-semibold mb-2">Receptor</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Nombre"
          value={receptor.nombre}
          onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="CIF"
          value={receptor.cif}
          onChange={(e) => setReceptor({ ...receptor, cif: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Dirección"
          value={receptor.direccion}
          onChange={(e) =>
            setReceptor({ ...receptor, direccion: e.target.value })
          }
          className="border p-2 rounded col-span-2"
        />
        <input
          placeholder="CP"
          value={receptor.cp}
          onChange={(e) => setReceptor({ ...receptor, cp: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Ciudad"
          value={receptor.ciudad}
          onChange={(e) => setReceptor({ ...receptor, ciudad: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Líneas */}
      <h2 className="text-xl font-semibold mb-2">Líneas</h2>
      {lineas.map((l, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            placeholder="Descripción"
            value={l.descripcion}
            onChange={(e) => {
              const newLineas = [...lineas];
              newLineas[i].descripcion = e.target.value;
              setLineas(newLineas);
            }}
            className="border p-2 rounded flex-1"
          />
          <input
            type="number"
            placeholder="Unidades"
            value={l.unidades}
            onChange={(e) => {
              const newLineas = [...lineas];
              newLineas[i].unidades = parseFloat(e.target.value);
              setLineas(newLineas);
            }}
            className="border p-2 rounded w-24"
          />
          <input
            type="number"
            placeholder="Precio unitario"
            value={l.precioUnitario}
            onChange={(e) => {
              const newLineas = [...lineas];
              newLineas[i].precioUnitario = parseFloat(e.target.value);
              setLineas(newLineas);
            }}
            className="border p-2 rounded w-32"
          />
          <button
            onClick={() =>
              setLineas(lineas.filter((_, idx) => idx !== i))
            }
            className="bg-red-500 text-white px-3 rounded"
          >
            X
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          setLineas([...lineas, { descripcion: "", unidades: 1, precioUnitario: 0 }])
        }
        className="mb-4 text-indigo-600 hover:underline"
      >
        + Añadir línea
      </button>

      {/* IVA / IRPF */}
      <div className="flex gap-4 mb-6">
        <div>
          <label>IVA (%)</label>
          <input
            type="number"
            value={iva}
            onChange={(e) => setIva(parseFloat(e.target.value))}
            className="border p-2 rounded w-20"
          />
        </div>
        <div>
          <label>IRPF (%)</label>
          <input
            type="number"
            value={irpf}
            onChange={(e) => setIrpf(parseFloat(e.target.value))}
            className="border p-2 rounded w-20"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          onClick={enviarVerifactu}
          className="bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Enviar a Verifactu
        </button>
        <button
          onClick={enviarFacturae}
          className="bg-gray-300 px-6 py-2 rounded"
        >
          Generar Facturae
        </button>
      </div>
    </div>
  );
}
