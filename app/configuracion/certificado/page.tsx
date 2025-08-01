"use client";

import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";

export default function CertificadoPage() {
  const user = useUser();
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPass, setCertPass] = useState("");

  const handleUpload = async () => {
    if (!certFile || !certPass) {
      return alert("Sube el certificado y pon la contraseña.");
    }

    const formData = new FormData();
    formData.append("certificado", certFile);
    formData.append("password", certPass);
    formData.append("userId", user?.id || "");

    const res = await fetch("/api/certificado", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Subir Certificado Digital</h1>
      <input
        type="file"
        onChange={(e) => setCertFile(e.target.files?.[0] || null)}
        className="border p-2 w-full my-2"
      />
      <input
        type="password"
        placeholder="Contraseña del certificado"
        value={certPass}
        onChange={(e) => setCertPass(e.target.value)}
        className="border p-2 w-full my-2"
      />
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        Guardar Certificado
      </button>
    </div>
  );
}
