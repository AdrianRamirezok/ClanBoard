import { NextResponse, type NextRequest } from 'next/server'

// El middleware ya no gestiona autenticación.
// La autenticación se maneja con Auth.js (NextAuth) en cada API route mediante auth() de @/auth.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [], // Sin rutas — middleware desactivado
}
