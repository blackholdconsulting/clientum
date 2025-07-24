'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { generateFacturaeXML } from '@/utils/facturae'; // ⬅️ crea este archivo abajo
import { signXMLAndSendToSII } from '@/utils/sii-client'; // ⬅️ crea este también

export default function NuevaFacturaPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [clientes, setClientes] = useState<{ id: string; nombre: string; nif: string }[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [fechaEmisor, setFechaEmisor] = useState(new Date().toISOString().slice(0, 10));
  const [concepto, setConcepto] = useState('');
  const [base, setBase] = useState(0);
  const [ivaPct, setIvaPct] = useState(21);
  const [estado, setEstado] = useState('emitida');

  const ivaTotal = parseFloat(((base * ivaPct) / 100).toFixed(2));
  const total = parseFloat((base + ivaTotal).toFixed(2));

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, nif').order('nombre').then(({ data }) => {
      if (data) setClientes(data);
    });
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return setError('No autenticado');

    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return setError('Cliente inválido');

    try {
      const xml = generateFacturaeXML({
        emisor: { nombre: 'BlackHold Consulting', nif: 'B12345678' },
        cliente,
        fecha: fechaEmisor,
        concepto,
        base,
        iva: ivaTotal,
        total,
      });

      const siiResult = await signXMLAndSendToSII(xml); // firma digital + envío

      await supabase.from('facturas').insert([{
        user_id: session.user.id,
        cliente_id: clienteId,
        fecha_emisor: fechaEmisor,
        concepto,
        base_imponib: base,
        iva_percent: ivaPct,
        iva_total: ivaTotal,
        total,
        estado,
        json_factura: { concepto, base, iva: ivaTotal },
        enlace_pdf: siiResult.enlace_pdf || null,
      }]);

      router.push('/facturas');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">➕ Nueva Factura</h1>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">Cancelar</button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            required value={clienteId} onChange={(e) => setClienteId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de emisión</label>
            <input type="date" value={fechaEmisor} onChange={(e) => setFechaEmisor(e.target.value)} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="borrador">Borrador</option>
              <option value="emitida">Emitida</option>
              <option value="pagada">Pagada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Concepto</label>
          <textarea value={concepto} onChange={(e) => setConcepto(e.target.value)} rows={3} className="w-full border px-3 py-2 rounded" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base (€)</label>
            <input type="number" value={base} onChange={(e) => setBase(parseFloat(e.target.value))} step="0.01" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">% IVA</label>
            <input type="number" value={ivaPct} onChange={(e) => setIvaPct(parseFloat(e.target.value))} step="1" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IVA total</label>
            <input readOnly value={ivaTotal.toFixed(2)} className="w-full border px-3 py-2 bg-gray-100 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total</label>
            <input readOnly value={total.toFixed(2)} className="w-full border px-3 py-2 bg-gray-100 rounded" />
          </div>
        </div>

        <div className="text-right">
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Generando…' : 'Emitir factura'}
          </button>
        </div>
      </form>
    </section>
  );
}
