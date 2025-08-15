'use client';

import { useEffect, useState } from 'react';

type Doc = {
  id: string; filename: string; sha256: string;
};

export default function DigitalizacionPage() {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy('subiendo');
    const fd = new FormData();
    fd.append('file', file);
    if (batchId) fd.append('batchId', batchId);
    const r = await fetch('/api/digitalizacion/ingestar', { method: 'POST', body: fd });
    const j = await r.json();
    setBusy(null);
    if (!r.ok) return setToast(j.error || 'Error al subir');
    setBatchId(j.batchId);
    setDocs((prev) => [...prev, { id: j.doc.id, filename: j.doc.filename, sha256: j.doc.sha256 }]);
  }

  async function seal() {
    if (!batchId) return;
    setBusy('sellando');
    const r = await fetch('/api/digitalizacion/cerrar-lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId }),
    });
    const j = await r.json();
    setBusy(null);
    if (!r.ok) return setToast(j.error || 'Error al sellar');
    setToast('Lote sellado ✅');
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Digitalización certificada (FZ01)</h1>
      <p className="text-sm text-gray-600 mb-4">
        Sube documentos escaneados, cierra el lote y descarga el paquete de evidencias.
      </p>

      <div className="border rounded-2xl p-4 bg-white mb-4">
        <input
          type="file"
          onChange={(e) => e.target.files && upload(e.target.files[0])}
          className="mb-3"
        />
        <div className="text-sm text-gray-600">Lote: {batchId ?? '—'}</div>
        <button
          onClick={seal}
          disabled={!batchId || !docs.length || !!busy}
          className="mt-3 px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {busy === 'sellando' ? 'Sellando…' : 'Cerrar lote y firmar manifiesto'}
        </button>
        {batchId && (
          <a
            href={`/api/digitalizacion/export/${batchId}`}
            className="ml-3 text-sm underline"
          >
            Descargar evidencias (ZIP)
          </a>
        )}
      </div>

      <div className="bg-white border rounded-2xl p-4">
        <h2 className="font-medium mb-2">Documentos del lote</h2>
        <ul className="text-sm space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="border rounded p-2">
              <div className="font-mono">{d.filename}</div>
              <div className="text-[11px] text-gray-500 break-all">sha256: {d.sha256}</div>
            </li>
          ))}
        </ul>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white text-sm px-3 py-2 rounded-xl shadow">
          {toast}
        </div>
      )}
    </main>
  );
}
