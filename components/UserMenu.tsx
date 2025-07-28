'use client'

import { useState } from 'react'
import { FiLogOut } from 'react-icons/fi'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function UserMenu() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    // opcional: redirigir tras logout
    // window.location.href = '/login'
  }

  return (
    <div className="mt-auto px-4 pb-4">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
      >
        <FiLogOut className="mr-2" />
        {loading ? 'Cerrando...' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
