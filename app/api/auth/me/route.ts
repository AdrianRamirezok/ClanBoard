import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: { id: authUser.userId, email: authUser.email } })
}
