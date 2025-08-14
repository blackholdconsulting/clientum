'use client';

import { useRef, useState } from 'react';

export default function AeatDemoPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rfJson, setRfJson] = useState(`{
  "emisorNIF": "A12345678",
  "serie": "2025A",
  "numero": "001",
  "fechaExpedicion": "2025-08-14",
  "importeTotal": 121.00,
  "baseImponible": 100.00,
  "cuotaIVA": 21.00,
  "tipoIVA": 21.0,
  "software": { "nombre": "Clientum Signer", "version": "0.0.1" }
}`);

  async function signXML() {
    const f = fileRef.current?.files?.[0];
    if (!f) return alert('Sube un XML Facturae sin firmar');
    const xml = await f.text();

    const res = await fetch('/api/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml
    });

    if (!res.ok) {
      const txt = await res.text();
      return alert(`Error firmando (${res.status}): ${txt}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name.replace(/\\.xml$/i, '') + '_firmada.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function genRF() {
    const res = await fetch('/api/verifactu/rf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rfJson
    });
    if (!res.ok) {
      const txt = await res.text();
      return alert(`Error RF (${res.status}): ${txt}`);
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rf.json';
    a.click();
  }

  async function genQR() {
    const res = await fetch('/api/verifactu/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rfJson
    });
    if (!res.ok) {
      const txt = await res.text();
      return alert(`Error QR (${res.status}): ${txt}`);
    }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'qr.png';
    a.click();
  }

  return (
    <main style={{maxWidth: 900, margin: '40px auto', padding: 24}}>
      <h1 style={{fontSize: 28, marginBottom: 8}}>Homologación AEAT – Clientum</h1>
      <p style={{opacity: .8, marginBottom: 24}}>
        Esta página permite a AEAT firmar un XML Facturae y generar RF/QR a través del proxy seguro.
      </p>

      <section style={{padding: 16, border: '1px solid #ddd', borderRadius: 12, marginBottom: 24}}>
        <h2>1) Firmar Facturae</h2>
        <input ref={fileRef} type="file" accept=".xml" />
        <div style={{marginTop: 12}}>
          <button onClick={signXML} style={{padding: '8px 16px'}}>Firmar XML</button>
        </div>
      </section>

      <section style={{padding: 16, border: '1px solid #ddd', borderRadius: 12}}>
        <h2>2) Veri*factu (RF + QR)</h2>
        <p>Edita los campos si lo necesitas:</p>
        <textarea
          value={rfJson}
          onChange={e => setRfJson(e.target.value)}
          rows={14}
          style={{width: '100%', fontFamily: 'monospace', fontSize: 14}}
        />
        <div style={{marginTop: 12, display: 'flex', gap: 12}}>
          <button onClick={genRF} style={{padding: '8px 16px'}}>Generar RF (JSON)</button>
          <button onClick={genQR} style={{padding: '8px 16px'}}>Generar QR (PNG)</button>
        </div>
      </section>
    </main>
  );
}
