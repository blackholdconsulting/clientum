// app/facturas/[id]/page.tsx
import React from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Layout from "../../../components/Layout";

interface FacturaRow {
  id: string;
  user_id: string;
  fecha_emisor: string;
  total: number;
  iva_total: number;
  estado: string;
}

interface ClienteRow {
  id: string;
  nombre: string;
  email: string;
}

interface SiiLog {
  estado: string;
  codigo: string;
  descripcion: string;
  enviado_at: string;
}

// Firmamos Page de forma genérica para evitar el choque con PageProps intern
export default async function Page(props: any) {
  const facturaId = props.params.id;
  const supabase = createServerComponentClient({ cookies });

  // Cargo la factura
  const { data: facturaData, error: facturaError } = await supabase
    .from("facturas")
    .select("*")
    .eq("id", facturaId)
    .single();
  if (facturaError || !facturaData) {
    return (
      <Layout>
        <p className="p-6">Error cargando factura.</p>
      </Layout>
    );
  }
  const factura = facturaData as FacturaRow;

  // Cargo el cliente asociado
  const { data: clienteData } = await supabase
    .from("clientes")
    .select("id, nombre, email")
    .eq("id", factura.user_id)
    .single();
  const cliente = (clienteData as ClienteRow) || null;

  // Cargo logs del SII
  const { data: logsData } = await supabase
    .from("sii_logs")
    .select("*")
    .eq("factura_id", facturaId);
  const siiLogs = (logsData as SiiLog[]) || [];

  return (
    <Layout>
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Factura {factura.id}</h1>
        <p>
          <strong>Fecha emisor:</strong>{" "}
          {new Date(factura.fecha_emisor).toLocaleDateString()}
        </p>
        <p>
          <strong>Cliente:</strong> {cliente?.nombre} ({cliente?.email})
        </p>
        <p>
          <strong>Total:</strong> {factura.total.toFixed(2)} € |{" "}
          <strong>IVA:</strong> {factura.iva_total.toFixed(2)} €
        </p>
        <p>
          <strong>Estado:</strong> {factura.estado}
        </p>

        <h2 className="mt-6 text-xl font-semibold">Logs SII</h2>
        <ul className="list-disc pl-5">
          {siiLogs.map((log, i) => (
            <li key={i}>
              {log.estado} – {log.codigo}: {log.descripcion} (
              {new Date(log.enviado_at).toLocaleString()})
            </li>
          ))}
          {siiLogs.length === 0 && <li>No hay registros.</li>}
        </ul>
      </main>
    </Layout>
  );
}
