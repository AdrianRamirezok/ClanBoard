import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: authUser.userId } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const [hogar, perfiles, tareas] = await Promise.all([
    prisma.hogar.findUnique({ where: { id: perfil.hogarId } }),
    prisma.perfil.findMany({ where: { hogarId: perfil.hogarId }, orderBy: { xp: 'desc' } }),
    prisma.tarea.findMany({ where: { hogarId: perfil.hogarId }, orderBy: { createdAt: 'desc' } }),
  ])

  if (!hogar) return NextResponse.json({ error: 'Hogar no encontrado' }, { status: 404 })

  return NextResponse.json({ perfil, hogar, perfiles, tareas })
}
