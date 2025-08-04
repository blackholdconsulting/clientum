// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Rutas públicas que no protegemos:
  if (
    // - Ayuda y Soporte
    pathname === '/help' ||
    pathname.startsWith('/help/') ||
    // - Archivos internos de Next.js
    pathname.startsWith('/_next/') ||
    // - Favicon
    pathname === '/favicon.ico' ||
    // - Rutas de Next-Auth (login, callback, etc)
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next()
  }

  // 2. Comprobamos si hay sesión/token válido
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // name: 'next-auth.session-token', // solo si cambiaste el nombre de la cookie
  })

  // 3. Si no hay token, redirigimos a login
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    // opcional: guarda la URL original para callback
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Si todo OK, dejamos pasar
  return NextResponse.next()
}

// 5. Configuración: ejecutamos middleware en TODAS las rutas
export const config = {
  matcher: '/:path*',
}
