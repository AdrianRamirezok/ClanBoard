import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  console.log('[GET /api/dashboard] session.user.id:', session?.user?.id ?? 'undefined')

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const userId = session.user.id

  const perfil = await prisma.perfil.findUnique({ where: { userId } })

  console.log('[GET /api/dashboard] perfil:', perfil
    ? { id: perfil.id, hogarId: perfil.hogarId, userId: perfil.userId }
    : 'null'
  )

  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const [hogar, perfilesRaw, tareas] = await Promise.all([
    prisma.hogar.findUnique({ where: { id: perfil.hogarId } }),
    prisma.perfil.findMany({ where: { hogarId: perfil.hogarId }, orderBy: { xp: 'desc' } }),
    prisma.tarea.findMany({ where: { hogarId: perfil.hogarId }, orderBy: { createdAt: 'desc' } }),
  ])

  console.log('[GET /api/dashboard] perfilesRaw.length:', perfilesRaw.length, '| hogar:', hogar?.id ?? 'null')

  if (!hogar) return NextResponse.json({ error: 'Hogar no encontrado' }, { status: 404 })

  // Edge case: si findMany devuelve vacío (comparación ObjectId en Atlas),
  // incluir al menos el perfil propio para que la lista de habitantes no quede vacía.
  const perfiles = perfilesRaw.length > 0
    ? perfilesRaw
    : [perfil]

  return NextResponse.json({ perfil, hogar, perfiles, tareas })
}
