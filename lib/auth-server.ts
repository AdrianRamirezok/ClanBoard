import { cookies } from 'next/headers'
import { verifyToken, type JwtPayload } from './jwt'
import { auth } from '@/auth'

// Checks the old JWT cookie first (backward compat), then falls back to
// the NextAuth session. All existing API routes continue to work unchanged.
export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (token) {
    const payload = verifyToken(token)
    if (payload) return payload
  }

  const session = await auth()
  if (session?.user?.id && session.user.email) {
    return { userId: session.user.id, email: session.user.email }
  }

  return null
}

export const AUTH_COOKIE = {
  name: 'auth-token',
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
} as const
