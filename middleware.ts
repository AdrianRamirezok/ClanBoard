import { NextResponse, type NextRequest } from 'next/server'

// El middleware ya no gestiona autenticación de Supabase.
// La autenticación se maneja por JWT en cada API route mediante lib/auth-server.ts.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [], // Sin rutas — middleware desactivado
}
