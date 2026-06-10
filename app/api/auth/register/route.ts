import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

function generarCodigo(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, mode, nombreHogar, nombrePerfil, codigoInvitacion } = await req.json()

    if (!email || !password || !nombrePerfil || !mode) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const existente = await prisma.user.findUnique({ where: { email } })
    if (existente) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const usuario = await prisma.user.create({
      data: { email, password: hashedPassword },
    })

    if (mode === 'crear') {
      if (!nombreHogar) {
        await prisma.user.delete({ where: { id: usuario.id } })
        return NextResponse.json({ error: 'El nombre del hogar es requerido' }, { status: 400 })
      }

      await prisma.hogar.create({
        data: {
          nombre: nombreHogar,
          codigoInvitacion: generarCodigo(),
          perfiles: {
            create: {
              userId: usuario.id,
              nombre: nombrePerfil,
              rol: 'admin',
              xp: 0,
              xpMensual: 0,
            },
          },
        },
      })
    } else if (mode === 'unirse') {
      if (!codigoInvitacion) {
        await prisma.user.delete({ where: { id: usuario.id } })
        return NextResponse.json({ error: 'El código de invitación es requerido' }, { status: 400 })
      }

      const hogar = await prisma.hogar.findUnique({
        where: { codigoInvitacion: codigoInvitacion.trim().toUpperCase() },
      })

      if (!hogar) {
        await prisma.user.delete({ where: { id: usuario.id } })
        return NextResponse.json({ error: 'Código de invitación no válido' }, { status: 404 })
      }

      await prisma.perfil.create({
        data: {
          userId: usuario.id,
          hogarId: hogar.id,
          nombre: nombrePerfil,
          rol: 'miembro',
          xp: 0,
          xpMensual: 0,
        },
      })
    } else {
      await prisma.user.delete({ where: { id: usuario.id } })
      return NextResponse.json({ error: 'Modo inválido' }, { status: 400 })
    }

    return NextResponse.json({ user: { id: usuario.id, email: usuario.email } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
