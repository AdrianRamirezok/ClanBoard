'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/login-page'
import { HomeBoard } from '@/components/home-board'

export default function Page() {
  const { isLoggedIn } = useAuth()

  return isLoggedIn ? <HomeBoard /> : <LoginPage />
}
