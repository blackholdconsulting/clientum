"use client";

import { useState, useEffect } from "react";
import { saveSetting, loadSetting } from "../../../utils/settings";

export default function FacturaeSettingsPage() {
  const [certPem, setCertPem] = useState("");
  const [keyPem, setKeyPem] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSetting("FACTURAE_CERT").then(v => v && setCertPem(v));
    loadSetting("FACTURAE_KEY").then(v => v && setKeyPem(v));
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSetting("FACTURAE_CERT", certPem);
    await saveSetting("FACTURAE_KEY", keyPem);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ajustes Facturae</h1>
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Certificado (PEM)</label>
          <textarea
            value={certPem}
            onChange={e => setCertPem(e.target.value)}
            className="w-full border px-3 py-2 rounded h-32 font-mono text-sm"
            placeholder="-----BEGIN CERTIFICATE-----\n..."
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Clave privada (PEM)</label>
          <textarea
            value={keyPem}
            onChange={e => setKeyPem(e.target.value)}
            className="w-full border px-3 py-2 rounded h-32 font-mono text-sm"
            placeholder="-----BEGIN PRIVATE KEY-----\n..."
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar
        </button>
        {saved && <p className="text-green-600">¡Guardado correctamente!</p>}
      </form>
    </main>
  );
}
