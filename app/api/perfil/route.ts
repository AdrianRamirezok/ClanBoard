import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await auth()

  console.log('[PATCH /api/perfil] session:', {
    userId: session?.user?.id ?? 'undefined',
    email: session?.user?.email ?? 'undefined',
    hasProfile: session?.user?.hasProfile ?? 'undefined',
  })

  if (!session?.user?.id) {
    console.log('[PATCH /api/perfil] → 401 sin sesión válida')
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const perfil = await prisma.perfil.update({
      where: { userId: session.user.id },
      data: { nombre: body.nombre, avatar: body.avatar },
    })
    return NextResponse.json(perfil)
  } catch (e) {
    console.error('[PATCH /api/perfil] error al actualizar:', e)
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}
