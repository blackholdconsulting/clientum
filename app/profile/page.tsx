'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [p12, setP12] = useState<File|null>(null)
  const [pass, setPass] = useState('')
  const [signed, setSigned] = useState<string|null>(null)
  const router = useRouter()

  const handleSign = async () => {
    if (!p12 || !pass) return alert('Selecciona tu .p12 y contraseña')

    const form = new FormData()
    form.append('p12', p12)
    form.append('pass', pass)
    form.append('payload', '<Facturae>…tu XML aquí…</Facturae>')

    const res = await fetch('/api/profile/sign', { method: 'POST', body: form })
    const json = await res.json()
    if (json.error) return alert('ERROR: ' + json.error)

    setSigned(json.signature)
    // aquí puedas subir `json.signature` y `json.cert` a Supabase Storage
    // y hacer upsert en tu tabla `perfil`
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h1>Mi perfil: Firma Digital FNMT</h1>
      <label>
        Selecciona P12 FNMT:
        <input type="file" accept=".p12" onChange={e=>setP12(e.target.files?.[0]||null)} />
      </label>
      <label>
        Contraseña:
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} />
      </label>
      <button onClick={handleSign}>Firmar XML</button>

      {signed && (
        <div>
          <h2>Firma (Base64):</h2>
          <textarea readOnly style={{ width: '100%', height: 200 }} value={signed} />
          <button onClick={()=>router.push('/')}>Volver al dashboard</button>
        </div>
      )}
    </div>
  )
}
