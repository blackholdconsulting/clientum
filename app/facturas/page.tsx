// app/facturas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Factura {
  id: string;
  cliente_id: string;
  fecha_emisor: string;
  total: number;
  iva_total: number;
  estado: string;
}

export default function FacturasPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacturas() {
      setLoading(true);
      const { data, error } = await supabase
        .from('facturas')
        .select('id, cliente_id, fecha_emisor, total, iva_total, estado');
      if (error) {
        console.error('Error cargando facturas:', error);
      } else if (data) {
        setFacturas(data as Factura[]);
      }
      setLoading(false);
    }
    loadFacturas();
  }, [supabase]);

  if (loading) {
    return <p className="p-6">Cargando facturas…</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas</h1>
      <ul className="list-disc pl-5 space-y-2">
        {facturas.map((f) => (
          <li key={f.id}>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => router.push(`/facturas/${f.id}`)}
            >
              {new Date(f.fecha_emisor).toLocaleDateString()} — {f.total.toFixed(2)} € — {f.estado}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
