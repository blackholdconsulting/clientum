"use client";

import { useEffect, useState } from "react";

interface Cliente {
  id: string;
  nombre: string;
}

interface Linea {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export default function NuevaFactura() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [tipoFactura, setTipoFactura] = useState("FACTURA");
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");
  const [iva, setIva] = useState(21);
  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: "", cantidad: 1, precio: 0 }]);

  const [empresa, setEmpresa] = useState({
    nombre: "",
    nif: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    cp: "",
    pais: "España",
    telefono: "",
    email: "",
    web: "",
  });

  useEffect(() => {
    const fetchClientes = async () => {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data.clientes || []);
    };
    const fetchPerfil = async () => {
      const res = await fetch("/api/usuario/perfil");
      const data = await res.json();
      if (data.success && data.perfil) {
        setEmpresa({
          nombre: data.perfil.nombre_empresa,
          nif: data.perfil.nif,
          direccion: data.perfil.direccion,
          ciudad: data.perfil.ciudad,
          provincia: data.perfil.provincia,
          cp: data.perfil.cp,
          pais: data.perfil.pais,
          telefono: data.perfil.telefono,
          email: data.perfil.email,
          web: data.perfil.web,
        });
      }
    };
    fetchClientes();
    fetchPerfil();
  }, []);

  const addLinea = () => setLineas([...lineas, { descripcion: "", cantidad: 1, precio: 0 }]);
  const removeLinea = (index: number) => setLineas(lineas.filter((_, i) => i !== index));
  const updateLinea = (index: number, field: keyof Linea, value: string | number) => {
    const updated: Linea[] = [...lineas];
    (updated[index] as Record<keyof Linea, any>)[field] =
      field === "cantidad" || field === "precio" ? parseFloat(value as string) : value;
    setLineas(updated);
  };

  const guardarFactura = async () => {
    const res = await fetch("/api/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serie,
        numero,
        cliente_id: clienteId,
        lineas,
        iva,
        tipo_factura: tipoFactura,
        metodo_pago: metodoPago,
        remitente: empresa,
      }),
    });
    const data = await res.json();
    alert(data.message || "Factura guardada");
  };

  const generarFacturae = async () => {
    const res = await fetch("/api/facturas/facturae", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serie,
        numero,
        cliente_id: clienteId,
        lineas,
        iva,
        tipo_factura: tipoFactura,
        metodo_pago: metodoPago,
        remitente: empresa,
      }),
    });
    const data = await res.json();
    alert(data.message || "Facturae generada");
  };

  const enviarVerifactu = async () => {
    const res = await fetch("/api/sii/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serie, numero }),
    });
    const data = await res.json();
    alert(data.message || "Factura enviada a AEAT");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Crear Factura</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="input" placeholder="Serie" value={serie} onChange={(e) => setSerie(e.target.value)} />
        <input className="input" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecciona Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select className="input" value={tipoFactura} onChange={(e) => setTipoFactura(e.target.value)}>
          <option value="FACTURA">Factura</option>
          <option value="RECTIFICATIVA">Rectificativa</option>
          <option value="ABONO">Abono</option>
        </select>
        <select className="input" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="EFECTIVO">Efectivo</option>
        </select>
        <input
          className="input"
          type="number"
          placeholder="IVA %"
          value={iva}
          onChange={(e) => setIva(parseFloat(e.target.value))}
        />
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2">Datos de la Empresa (Remitente)</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="input" placeholder="Nombre o Razón Social" value={empresa.nombre} readOnly />
        <input className="input" placeholder="NIF / CIF" value={empresa.nif} readOnly />
        <input className="input col-span-2" placeholder="Dirección" value={empresa.direccion} readOnly />
        <input className="input" placeholder="Ciudad" value={empresa.ciudad} readOnly />
        <input className="input" placeholder="Provincia" value={empresa.provincia} readOnly />
        <input className="input" placeholder="Código Postal" value={empresa.cp} readOnly />
        <input className="input" placeholder="País" value={empresa.pais} readOnly />
        <input className="input" placeholder="Teléfono" value={empresa.telefono} readOnly />
        <input className="input" placeholder="Email" value={empresa.email} readOnly />
        <input className="input" placeholder="Web" value={empresa.web} readOnly />
      </div>

      <h2 className="text-lg font-semibold mb-2">Líneas de servicio</h2>
      {lineas.map((linea, index) => (
        <div key={index} className="grid grid-cols-5 gap-2 mb-2">
          <input
            className="input col-span-2"
            placeholder="Descripción"
            value={linea.descripcion}
            onChange={(e) => updateLinea(index, "descripcion", e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Cantidad"
            value={linea.cantidad}
            onChange={(e) => updateLinea(index, "cantidad", e.target.value)}
          />
          <input
            className="input"
            type="number"
            placeholder="Precio"
            value={linea.precio}
            onChange={(e) => updateLinea(index, "precio", e.target.value)}
          />
          <button className="bg-red-500 text-white px-2 rounded" onClick={() => removeLinea(index)}>
            Eliminar
          </button>
        </div>
      ))}
      <button className="bg-green-500 text-white px-4 py-1 rounded mb-4" onClick={addLinea}>
        Añadir línea
      </button>

      <div className="flex justify-between">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={guardarFactura}>
          Guardar Factura
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={generarFacturae}>
          Facturae
        </button>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={enviarVerifactu}>
          Verifactu
        </button>
      </div>

      <style jsx>{`
        .input {
          border: 1px solid #ddd;
          padding: 0.5rem;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
