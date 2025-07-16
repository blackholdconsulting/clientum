'use client'
import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function LicenseGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const hasLicense = localStorage.getItem('licenseActive') === 'true'
    console.log('🔐 LicenseGuard:', { hasLicense, pathname })

    if (!hasLicense && !pathname.startsWith('/settings/license')) {
      console.log('→ Sin licencia, voy a settings/license')
      router.replace('/settings/license')
    }
    // ← Ya NO redirigimos de settings/license a dashboard
    // cuando hay licencia. Así permitimos navegar a cualquier ruta.
  }, [router, pathname])

  return <>{children}</>
}
