"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabaseClient";
import { generarCodigoFactura, registraVenta } from "@/lib/ventas";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function CrearFacturaPage() {
  // Cabecera
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  // Emisor (ahora completamente editable; podrías cargarte por defecto el nombre de la empresa desde supabase)
  const [emisor, setEmisor] = useState({
    nombre: "",     // antes estaba fijo; ahora lo dejamos vacío para personalizar
    direccion: "",
    nif: "",
    cp: "",
    ciudad: "",
    email: "",
  });

  // Receptor
  const [receptor, setReceptor] = useState({
    nombre: "",
    direccion: "",
    cif: "",
    cp: "",
    ciudad: "",
    email: "",
  });

  // Líneas de factura
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);

  // Impuestos
  const [ivaPct, setIvaPct] = useState(21);
  const [irpfPct, setIrpfPct] = useState(0);
  const [loading, setLoading] = useState(false);

  const addLinea = () =>
    setLineas((prev) => [
      ...prev,
      { descripcion: "", unidades: 1, precioUnitario: 0 },
    ]);

  const onLineaChange = (
    idx: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setLineas((prev) =>
      prev.map((l, i) =>
        i === idx
          ? {
              ...l,
              [name]:
                name === "descripcion"
                  ? value
                  : parseFloat(value) || 0,
            }
          : l
      )
    );
  };

  const calcularTotales = () => {
    const base = lineas.reduce(
      (sum, l) => sum + l.unidades * l.precioUnitario,
      0
    );
    const iva = +(base * ivaPct) / 100;
    const irpf = +(base * irpfPct) / 100;
    const total = base + iva - irpf;
    return { base, iva, irpf, total };
  };

  const handleVerifactu = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numero = generarCodigoFactura();

    // 1) Guardar en facturas
    const { error: facErr } = await supabase
      .from("facturas")
      .insert({
        fecha,
        vencimiento,
        emisor,
        receptor,
        numero_factura: numero,
        lineas,
        iva: ivaPct,
        irpf: irpfPct,
        via: "verifactu",
      });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // 2) Registrar en ventas
    const { base, iva } = calcularTotales();
    try {
      await registraVenta({
        fecha,
        cliente_id: receptor.nombre,
        numero_factura: numero,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert(
        "Factura creada, pero no pudo registrarse en ventas: " +
          err.message
      );
    }

    // 3) Envío a Verifactu...
    // await fetch("/api/verifactu", ...)

    setLoading(false);
    alert("Verifactu creada: " + numero);
  };

  const handleFacturae = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numero = generarCodigoFactura();

    // 1) Guardar en facturas
    const { error: facErr } = await supabase
      .from("facturas")
      .insert({
        fecha,
        vencimiento,
        emisor,
        receptor,
        numero_factura: numero,
        lineas,
        iva: ivaPct,
        irpf: irpfPct,
        via: "facturae",
      });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // 2) Registrar en ventas
    const { base, iva } = calcularTotales();
    try {
      await registraVenta({
        fecha,
        cliente_id: receptor.nombre,
        numero_factura: numero,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert(
        "Factura creada, pero no pudo registrarse en ventas: " +
          err.message
      );
    }

    // 3) Generar y enviar Facturae...
    // const xml = buildFacturaeXML({ numero, ... });
    // await fetch("/api/facturae", ...)

    setLoading(false);
    alert("Facturae generada: " + numero);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 space-y-6">
      <h1 className="text-2xl font-bold">Crear Factura</h1>

      <form className="space-y-6 bg-white p-8 rounded shadow">
        {/* Cabecera */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </div>

        {/* Emisor */}
        <fieldset className="space-y-2">
          <legend className="font-semibold">Emisor</legend>
          <input
            placeholder="Nombre"
            value={emisor.nombre}
            onChange={(e) =>
              setEmisor({ ...emisor, nombre: e.target.value })
            }
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
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="NIF"
              value={emisor.nif}
              onChange={(e) =>
                setEmisor({ ...emisor, nif: e.target.value })
              }
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="CP"
              value={emisor.cp}
              onChange={(e) =>
                setEmisor({ ...emisor, cp: e.target.value })
              }
              className="border rounded px-3 py-2"
            />
          </div>
          <input
            placeholder="Ciudad"
            value={emisor.ciudad}
            onChange={(e) =>
              setEmisor({ ...emisor, ciudad: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="Email"
            value={emisor.email}
            onChange={(e) =>
              setEmisor({ ...emisor, email: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </fieldset>

        {/* Receptor */}
        <fieldset className="space-y-2">
          <legend className="font-semibold">Receptor</legend>
          <input
            placeholder="Nombre"
            value={receptor.nombre}
            onChange={(e) =>
              setReceptor({ ...receptor, nombre: e.target.value })
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
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="CIF"
              value={receptor.cif}
              onChange={(e) =>
                setReceptor({ ...receptor, cif: e.target.value })
              }
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="CP"
              value={receptor.cp}
              onChange={(e) =>
                setReceptor({ ...receptor, cp: e.target.value })
              }
              className="border rounded px-3 py-2"
            />
          </div>
          <input
            placeholder="Ciudad"
            value={receptor.ciudad}
            onChange={(e) =>
              setReceptor({ ...receptor, ciudad: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="Email"
            value={receptor.email}
            onChange={(e) =>
              setReceptor({ ...receptor, email: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </fieldset>

        {/* Líneas */}
        <fieldset className="space-y-4">
          <legend className="font-semibold">Líneas</legend>
          {lineas.map((l, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 items-center"
            >
              <input
                name="descripcion"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="unidades"
                type="number"
                placeholder="Unidades"
                value={l.unidades}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="precioUnitario"
                type="number"
                placeholder="P.U."
                step="0.01"
                value={l.precioUnitario}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
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
          ))}
        </fieldset>

        {/* Impuestos y acciones */}
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              value={ivaPct}
              onChange={(e) => setIvaPct(+e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input
              type="number"
              value={irpfPct}
              onChange={(e) => setIrpfPct(+e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"            />
          </div>
          <div className="col-span-2 flex space-x-4 justify-end">
            <button
              onClick={handleVerifactu}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {loading ? "Procesando…" : "Enviar a Verifactu"}
            </button>
            <button
              onClick={handleFacturae}
              disabled={loading}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              {loading ? "Procesando…" : "Generar Facturae"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
