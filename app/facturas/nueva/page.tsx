"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

interface Linea {
  descripcion: string;
  cantidad: number;
  precio: number;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  tableHeader: { flexDirection: "row", borderBottom: "1px solid #000", paddingBottom: 5 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 3 },
  total: { marginTop: 10, textAlign: "right" },
});

function FacturaPDF({ serie, numero, cliente, lineas, iva }: any) {
  const subtotal = lineas.reduce((sum: number, l: any) => sum + l.cantidad * l.precio, 0);
  const ivaTotal = (subtotal * iva) / 100;
  const total = subtotal + ivaTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>FACTURA Nº {numero}</Text>
          <Text>Serie: {serie}</Text>
        </View>

        <View style={styles.section}>
          <Text>Cliente: {cliente.nombre}</Text>
          <Text>Dirección: {cliente.direccion}</Text>
          <Text>Tel: {cliente.telefono} - Email: {cliente.email}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ width: "50%" }}>Descripción</Text>
          <Text style={{ width: "20%", textAlign: "center" }}>Cant.</Text>
          <Text style={{ width: "30%", textAlign: "right" }}>Precio</Text>
        </View>

        {lineas.map((linea: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={{ width: "50%" }}>{linea.descripcion}</Text>
            <Text style={{ width: "20%", textAlign: "center" }}>{linea.cantidad}</Text>
            <Text style={{ width: "30%", textAlign: "right" }}>{linea.precio.toFixed(2)} €</Text>
          </View>
        ))}

        <View style={styles.total}>
          <Text>Subtotal: {subtotal.toFixed(2)} €</Text>
          <Text>IVA ({iva}%): {ivaTotal.toFixed(2)} €</Text>
          <Text>Total: {total.toFixed(2)} €</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function NuevaFactura() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [iva, setIva] = useState(21);
  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: "", cantidad: 1, precio: 0 }]);

  const clienteSeleccionado = clientes.find((c) => c.id === clienteId);

  useEffect(() => {
    const fetchClientes = async () => {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data.clientes || []);
    };
    fetchClientes();
  }, []);

  const addLinea = () => setLineas([...lineas, { descripcion: "", cantidad: 1, precio: 0 }]);
  const removeLinea = (index: number) => setLineas(lineas.filter((_, i) => i !== index));
  const updateLinea = (index: number, field: keyof Linea, value: any) => {
    const updated = [...lineas];
    updated[index][field] = field === "cantidad" || field === "precio" ? parseFloat(value) : value;
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
      }),
    });
    const data = await res.json();
    alert(data.message || "Factura guardada");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Crear Factura</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="input" placeholder="Serie" value={serie} onChange={(e) => setSerie(e.target.value)} />
        <input className="input" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <select className="input col-span-2" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecciona Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <h2 className="text-lg font-semibold mb-2">Líneas de servicio</h2>
      {lineas.map((linea, index) => (
        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
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

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          className="input"
          type="number"
          placeholder="IVA %"
          value={iva}
          onChange={(e) => setIva(parseFloat(e.target.value))}
        />
      </div>

      <div className="flex justify-between">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={guardarFactura}>
          Guardar Factura
        </button>
        {clienteSeleccionado && (
          <PDFDownloadLink
            document={
              <FacturaPDF
                serie={serie}
                numero={numero}
                cliente={clienteSeleccionado}
                lineas={lineas}
                iva={iva}
              />
            }
            fileName={`Factura-${serie}-${numero}.pdf`}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Descargar PDF
          </PDFDownloadLink>
        )}
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
