import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

function generarCodigo(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { nombreHogar, nombrePerfil } = body

  if (!nombreHogar || !nombrePerfil) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const hogar = await prisma.hogar.create({
    data: {
      nombre: nombreHogar,
      codigoInvitacion: generarCodigo(),
      perfiles: {
        create: {
          userId: authUser.userId,
          nombre: nombrePerfil,
          rol: 'admin',
          xp: 0,
          xpMensual: 0,
        },
      },
    },
  })

  return NextResponse.json(hogar, { status: 201 })
}
