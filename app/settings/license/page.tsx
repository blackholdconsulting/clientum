'use client'

import { useState } from 'react'

export default function LicensePage() {
  const [key, setKey] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleActivate() {
    setMsg(null)
    const res = await fetch('/api/licenses/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key }),
    })
    const json = await res.json()
    if (res.ok) {
      localStorage.setItem('licenseActive', 'true')
      setMsg({ ok: true, text: '✅ Licencia activada correctamente. Ahora puedes continuar.' })
    } else {
      setMsg({ ok: false, text: '❌ ' + (json.error || 'Error inesperado') })
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 500, margin: 'auto' }}>
      <h1>Activar licencia</h1>
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Clave de licencia"
        style={{ width: '100%', margin: '1em 0', padding: 8 }}
      />
      <button onClick={handleActivate} style={{ padding: '8px 16px' }}>
        Activar
      </button>

      {msg && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: msg.ok ? 'green' : 'red' }}>{msg.text}</p>
          {msg.ok && (
            // Sólo mostrar el link a dashboard tras OK
            <p>
              <a href="/dashboard">→ Ir al Dashboard</a>
            </p>
          )}
        </div>
      )}
    </main>
  )
}
