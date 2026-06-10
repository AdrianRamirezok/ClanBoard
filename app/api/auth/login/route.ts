import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { AUTH_COOKIE } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const passwordOk = await bcrypt.compare(password, usuario.password)
    if (!passwordOk) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const token = signToken({ userId: usuario.id, email: usuario.email })

    const res = NextResponse.json({ user: { id: usuario.id, email: usuario.email } })
    res.cookies.set(AUTH_COOKIE.name, token, AUTH_COOKIE.options)
    return res
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
