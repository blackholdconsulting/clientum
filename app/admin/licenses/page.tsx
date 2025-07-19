// app/admin/licenses/page.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface License {
  key: string;
  active: boolean;
}

export default function LicensesPage() {
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);

  async function createLicense() {
    setLoading(true);
    const newKey = crypto.randomUUID().toUpperCase();

    // INSERT con dos genéricos: <Row, Insert>
    const { data, error } = await supabase
      .from<License, License>("licenses")
      .insert([{ key: newKey, active: false }]);

    if (error) {
      console.error("Error creando licencia:", error);
    } else if (data) {
      setLicenses((prev) => [...prev, ...data]);
    }

    setLoading(false);
  }

  async function loadLicenses() {
    setLoading(true);
    // SELECT con dos genéricos: <Row, Select>
    const { data, error } = await supabase
      .from<License, License>("licenses")
      .select("*");

    if (error) {
      console.error("Error cargando licencias:", error);
    } else if (data) {
      setLicenses(data);
    }
    setLoading(false);
  }

  // Carga inicial
  React.useEffect(() => {
    loadLicenses();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={createLicense}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Creando…" : "Crear nueva licencia"}
      </button>
      <ul className="list-disc pl-5">
        {licenses.map((lic) => (
          <li key={lic.key}>
            {lic.key} — {lic.active ? "Activa" : "Inactiva"}
          </li>
        ))}
      </ul>
    </div>
  );
}
