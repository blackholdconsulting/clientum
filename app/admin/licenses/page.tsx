// app/admin/licenses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient }    from '@supabase/auth-helpers-react'
import SidebarLayout            from '@/components/Layout'
import type { Database }        from '@/lib/supabaseClient'

type License = {
  id: string
  key: string
  user_id: string
  active: boolean
  created_at: string
}

export default function AdminLicensesPage() {
  const supabase = useSupabaseClient<Database>()
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading]   = useState(true)

  // 1) Carga inicial
  useEffect(() => {
    supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLicenses(data ?? [])
        setLoading(false)
      })
  }, [supabase])

  // 2) Generar nueva clave
  const generateNew = async () => {
    setLoading(true)
    const newKey = crypto.randomUUID().toUpperCase()
    await supabase.from('licenses').insert({ key: newKey, active: false })
    const { data } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })
    setLicenses(data ?? [])
    setLoading(false)
  }

  // 3) Activar / revocar
  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('licenses').update({ active: !current }).eq('id', id)
    setLicenses(licenses.map(l => l.id === id ? { ...l, active: !current } : l))
  }

  if (loading) return <div className="p-6">Cargando licencias…</div>

  return (
    <SidebarLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Licencias</h1>
        <button
          onClick={generateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Nueva clave
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Clave','Usuario','Activo','Creado','Acciones'].map(h => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map(lic => (
              <tr key={lic.id}>
                <td className="px-6 py-4 font-mono text-sm break-all">{lic.key}</td>
                <td className="px-6 py-4">{lic.user_id || '—'}</td>
                <td className="px-6 py-4">
                  {lic.active
                    ? <span className="text-green-600">Activo</span>
                    : <span className="text-red-600">Inactivo</span>}
                </td>
                <td className="px-6 py-4">
                  {new Date(lic.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(lic.id, lic.active)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    {lic.active ? 'Revocar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  )
}
