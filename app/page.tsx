'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/login-page'
import { HomeBoard } from '@/components/home-board'

export default function Page() {
  const { isLoggedIn, loading, settingUp } = useAuth()

  if (loading || settingUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <p className="font-handwritten text-2xl text-amber-700">
          {settingUp ? 'Creando tu hogar...' : 'Cargando...'}
        </p>
      </div>
    )
  }

  return isLoggedIn ? <HomeBoard /> : <LoginPage />
}
