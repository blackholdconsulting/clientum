// app/sign/page.tsx
'use client';

import { useState } from 'react';

export default function SignPage() {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [ksFile, setKsFile] = useState<File | null>(null);
  const [ksPassword, setKsPassword] = useState('');
  const [keyAlias, setKeyAlias] = useState('');
  const [keyPassword, setKeyPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!xmlFile) return setMsg('Subí un XML a firmar.');
    if (!ksFile) return setMsg('Subí tu archivo .p12/.pfx.');
    if (!ksPassword) return setMsg('Ingresá la contraseña del keystore.');

    const form = new FormData();
    form.append('xmlFile', xmlFile);
    form.append('keystoreFile', ksFile);
    form.append('keystorePassword', ksPassword);
    if (keyAlias) form.append('keyAlias', keyAlias);
    if (keyPassword) form.append('keyPassword', keyPassword);

    setLoading(true);
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        let errText = 'Error al firmar.';
        try {
          const j = await res.json();
          errText = j?.error || errText;
        } catch {}
        throw new Error(errText);
      }

      // Puede venir XML o binario; mejor descargar como archivo
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition');
      const suggested =
        cd?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/)?.[1] ||
        'signed.xml';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggested;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMsg('¡Documento firmado y descargado!');
    } catch (err: any) {
      setMsg(err?.message ?? 'Fallo inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: 16 }}>
      <h1>Firmar XML</h1>
      <p style={{ color: '#666' }}>
        Subí tu XML y tu certificado (.p12/.pfx). Tus credenciales solo viajan a tu
        backend (no se guardan en el navegador).
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          XML a firmar
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            onChange={(e) => setXmlFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          Keystore (.p12/.pfx)
          <input
            type="file"
            accept=".p12,.pfx,application/x-pkcs12"
            onChange={(e) => setKsFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          Contraseña del keystore
          <input
            type="password"
            value={ksPassword}
            onChange={(e) => setKsPassword(e.target.value)}
            placeholder="********"
          />
        </label>

        <label>
          Alias de la clave (opcional)
          <input
            type="text"
            value={keyAlias}
            onChange={(e) => setKeyAlias(e.target.value)}
            placeholder="ej: mykey"
          />
        </label>

        <label>
          Contraseña de la clave (opcional)
          <input
            type="password"
            value={keyPassword}
            onChange={(e) => setKeyPassword(e.target.value)}
            placeholder="********"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Firmando…' : 'Firmar'}
        </button>

        {msg && <p style={{ color: msg.startsWith('¡') ? 'green' : 'crimson' }}>{msg}</p>}
      </form>
    </div>
  );
}
