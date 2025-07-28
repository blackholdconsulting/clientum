// components/UserMenu.tsx
"use client"             // esto hace que sea un Client Component
import { useRouter } from "next/navigation"

export default function UserMenu() {
  const router = useRouter()

  const handleLogout = async () => {
    // aquí tu lógica de logout (p. ej. petición /api/logout, limpieza de cookies…)
    // luego rediriges a login o home:
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left py-2 px-3 rounded hover:bg-gray-100"
    >
      Cerrar sesión
    </button>
  )
}
