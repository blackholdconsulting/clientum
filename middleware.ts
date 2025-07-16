// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // 1) En desarrollo, no hacemos nada
  if (
    process.env.NODE_ENV === 'development' ||
    req.nextUrl.hostname === 'localhost'
  ) {
    return NextResponse.next()
  }

  // 2) En producción, comprobamos aquí tu lógica de licencia.
  //    Reemplaza este bloque con tu verificación real:
  const hasLicense = false  // <-- sustituye por `chequeoCookie || JWT || consultaDB()`

  // 3) Si no hay licencia y no estamos ya en /settings/license, redirigimos
  if (!hasLicense && !req.nextUrl.pathname.startsWith('/settings/license')) {
    const url = req.nextUrl.clone()
    url.pathname = '/settings/license'
    return NextResponse.redirect(url)
  }

  // 4) Por defecto, dejamos pasar
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
