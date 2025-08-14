"use client";

import { useEffect, useState } from "react";

type Factura = {
  id: string;
  numero?: string;
  fecha?: string;
  cliente?: string;
  estado?: string;
  csv?: string;
};

export default function FacturasElectronicasPage() {
  // ====== Tabla original ======
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await fetch("/api/facturas");
        const data = await res.json();
        if (data.success) setFacturas(data.facturas);
      } catch (error) {
        console.error("Error cargando facturas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  // ====== Firma XML (AEAT) ======
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [signBusy, setSignBusy] = useState(false);
  const [signMsg, setSignMsg] = useState<string | null>(null);
  const [signedXmlUrl, setSignedXmlUrl] = useState<string | null>(null);

  const handleSignXml = async () => {
    if (!xmlFile) {
      setSignMsg("Selecciona un XML primero.");
      return;
    }
    setSignBusy(true);
    setSignMsg(null);
    setSignedXmlUrl(null);

    try {
      const fd = new FormData();
      fd.append("file", xmlFile);

      // 👉 Proxy seguro en Next.js (app/api/sign/route.ts)
      const res = await fetch("/api/sign", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(
          `Error ${res.status}: ${txt || "No se pudo firmar el XML"}`
        );
      }

      const ct = res.headers.get("content-type") || "";
      // El microservicio puede devolver XML directamente o JSON con el XML dentro.
      if (ct.includes("xml")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setSignedXmlUrl(url);
        setSignMsg("XML firmado correctamente.");
      } else {
        const json = await res.json();
        // Intenta detectar el XML firmado en el JSON
        const raw =
          json.signedXml ||
          json.xml ||
          json.data ||
          json.content ||
          json.signed ||
          null;

        if (typeof raw === "string") {
          const blob = new Blob([raw], { type: "application/xml" });
          const url = URL.createObjectURL(blob);
          setSignedXmlUrl(url);
          setSignMsg("XML firmado correctamente.");
        } else {
          setSignMsg(
            "Firmado completado, pero no se recibió un XML directamente. Respuesta disponible en consola."
          );
          console.log("Respuesta firma:", json);
        }
      }
    } catch (e: any) {
      setSignMsg(e?.message || "Error firmando el XML.");
    } finally {
      setSignBusy(false);
    }
  };

  // ====== Veri*factu (RF + QR) ======
  const [rfInput, setRfInput] = useState<string>(
    JSON.stringify(
      {
        emisorNIF: "A12345678",
        serie: "2025A",
        numero: "001",
        fechaExpedicion: "2025-08-14",
        importeTotal: 121.0,
        baseImponible: 100.0,
        cuotaIVA: 21.0,
        tipoIVA: 21.0,
        software: { nombre: "Clientum Signer", version: "0.0.1" },
      },
      null,
      2
    )
  );
  const [rfBusy, setRfBusy] = useState(false);
  const [rfResult, setRfResult] = useState<any>(null);

  const [qrBusy, setQrBusy] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const handleGenerateRF = async () => {
    setRfBusy(true);
    setRfResult(null);
    try {
      const payload = JSON.parse(rfInput);
      const res = await fetch("/api/verifactu/rf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error RF (${res.status}): ${text}`);
      }
      const json = await res.json();
      setRfResult(json);
    } catch (e: any) {
      setRfResult({ error: e?.message || "Error generando RF" });
    } finally {
      setRfBusy(false);
    }
  };

  const handleGenerateQR = async () => {
    setQrBusy(true);
    setQrUrl(null);
    try {
      const payload = JSON.parse(rfInput);
      const res = await fetch("/api/verifactu/qr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error QR (${res.status}): ${text}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setQrUrl(url);
    } catch (e: any) {
      alert(e?.message || "Error generando QR");
    } finally {
      setQrBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Facturas Electrónicas</h1>

      {/* ========== Sección: Firma XML (AEAT) ========== */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">1) Firmar Factura (XML)</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".xml"
            onChange={(e) => setXmlFile(e.target.files?.[0] || null)}
            className="block w-full sm:w-auto"
          />

          <button
            onClick={handleSignXml}
            disabled={signBusy}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {signBusy ? "Firmando..." : "Firmar XML"}
          </button>

          {signMsg && <p className="text-sm text-gray-700">{signMsg}</p>}
          {signedXmlUrl && (
            <a
              href={signedXmlUrl}
              download="factura-firmada.xml"
              className="text-indigo-700 underline"
            >
              Descargar XML firmado
            </a>
          )}
        </div>
      </section>

      {/* ========== Sección: Veri*factu (RF + QR) ========== */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">2) Veri*factu (RF + QR)</h2>

        <p className="text-sm text-gray-600 mb-2">
          Edita los campos si lo necesitas:
        </p>
        <textarea
          value={rfInput}
          onChange={(e) => setRfInput(e.target.value)}
          rows={12}
          className="w-full font-mono text-sm border rounded p-3"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={handleGenerateRF}
            disabled={rfBusy}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {rfBusy ? "Generando RF..." : "Generar RF (JSON)"}
          </button>
          <button
            onClick={handleGenerateQR}
            disabled={qrBusy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {qrBusy ? "Generando QR..." : "Generar QR (PNG)"}
          </button>
          {qrUrl && (
            <a
              href={qrUrl}
              download="verifactu-qr.png"
              className="text-blue-700 underline"
            >
              Descargar QR
            </a>
          )}
        </div>

        {/* Resultados */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-medium mb-2">Resultado RF</h3>
            <pre className="text-xs overflow-auto">
              {rfResult ? JSON.stringify(rfResult, null, 2) : "—"}
            </pre>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-medium mb-2">QR generado</h3>
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR Veri*factu" className="max-w-xs" />
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        </div>
      </section>

      {/* ========== Tu tabla original ========== */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Histórico de envíos</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : facturas.length === 0 ? (
          <p>No hay facturas enviadas todavía.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Número</th>
                  <th className="border p-2">Fecha</th>
                  <th className="border p-2">Cliente</th>
                  <th className="border p-2">Estado AEAT</th>
                  <th className="border p-2">CSV</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id}>
                    <td className="border p-2">{f.numero}</td>
                    <td className="border p-2">
                      {f.fecha ? new Date(f.fecha).toLocaleDateString() : "-"}
                    </td>
                    <td className="border p-2">{f.cliente}</td>
                    <td className="border p-2">{f.estado}</td>
                    <td className="border p-2">{f.csv || "-"}</td>
                    <td className="border p-2">
                      <a
                        href={`/facturas/factura-electronica/${f.id}`}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        Ver detalle
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
