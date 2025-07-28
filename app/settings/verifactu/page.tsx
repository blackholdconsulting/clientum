"use client";

import { useState, useEffect } from "react";
import { saveSetting, loadSetting } from "../../../utils/settings";

export default function VerifactuSettingsPage() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSetting("VERIFACTU_KEY").then(savedKey => {
      if (savedKey) setKey(savedKey);
    });
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSetting("VERIFACTU_KEY", key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ajustes Verifactu</h1>
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Clave secreta de Verifactu</label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="sk_..."
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
