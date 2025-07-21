// app/settings/certs/page.tsx
'use client'

import { useState, FormEvent } from 'react'

export default function CertUploadPage() {
  const [file, setFile] = useState<File|null>(null)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string| null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file || !password) {
      setMessage('Selecciona un archivo y escribe la contraseña.')
      return
    }
    setLoading(true)
    setMessage(null)
    const form = new FormData()
    form.append('certfile', file)
    form.append('password', password)

    const res = await fetch('/api/certs/upload', {
      method: 'POST',
      body: form,
    })
    const json = await res.json()
    if (res.ok) {
      setMessage('✔ Certificado subido y procesado correctamente.')
    } else {
      setMessage(`❌ Error: ${json.error}`)
    }
    setLoading(false)
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subir Certificado Digital</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="flex flex-col">
          <label className="mb-1">Archivo .p12 / .pfx</label>
          <input
            type="file"
            accept=".p12,.pfx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">Contraseña del archivo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {loading ? 'Procesando…' : 'Subir y procesar'}
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </section>
  )
}
