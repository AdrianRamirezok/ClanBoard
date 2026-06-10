import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en .env.local')
}

export interface JwtPayload {
  userId: string
  email: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}
