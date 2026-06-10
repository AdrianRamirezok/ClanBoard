import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { nombrePerfil, codigoInvitacion } = body

  if (!nombrePerfil || !codigoInvitacion) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const hogar = await prisma.hogar.findUnique({
    where: { codigoInvitacion: codigoInvitacion.trim().toUpperCase() },
  })
  if (!hogar) {
    return NextResponse.json({ error: 'Código de invitación no válido' }, { status: 404 })
  }

  const perfil = await prisma.perfil.create({
    data: {
      userId: authUser.userId,
      hogarId: hogar.id,
      nombre: nombrePerfil,
      rol: 'miembro',
      xp: 0,
      xpMensual: 0,
    },
  })

  return NextResponse.json(perfil, { status: 201 })
}
