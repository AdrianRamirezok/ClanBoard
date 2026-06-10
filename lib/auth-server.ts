import { cookies } from 'next/headers'
import { verifyToken, type JwtPayload } from './jwt'

export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
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
