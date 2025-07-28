'use client'

import { ReactNode } from 'react'
import LicenseGuard from './LicenseGuard'

export default function ClientGuard({ children }: { children: ReactNode }) {
  // Esto se ejecuta **solo en cliente**, porque tiene 'use client' arriba
  return <LicenseGuard>{children}</LicenseGuard>
}
