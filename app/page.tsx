'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AuthDrawer, type AuthMode } from '@/components/auth-drawer'
import { HogarSetupSheet } from '@/components/hogar-setup-sheet'
import { HomeBoard } from '@/components/home-board'
import { Button } from '@/components/ui/button'

export default function Page() {
  const { isLoggedIn, loading, settingUp, hasProfile } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<AuthMode>('login')

  const openDrawer = (mode: AuthMode) => {
    setDrawerMode(mode)
    setDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <p className="font-handwritten text-2xl text-amber-700">Cargando...</p>
      </div>
    )
  }

  if (settingUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <p className="font-handwritten text-2xl text-amber-700">Creando tu hogar...</p>
      </div>
    )
  }

  // Google user logged in but hasn't set up a household yet
  if (isLoggedIn && !hasProfile) return <HogarSetupSheet />

  if (isLoggedIn) return <HomeBoard />

  return (
    <>
      {/* Pantalla de bienvenida */}
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-8">
        {/* Branding */}
        <div className="text-center mb-10 select-none">
          <div className="text-7xl mb-5">🏠</div>
          <h1 className="font-handwritten text-6xl font-bold text-amber-800 mb-2">
            ClanBoard
          </h1>
          <p className="text-amber-600 text-lg">El tablero familiar inteligente</p>

          <div className="mt-7 flex flex-col gap-1.5 text-amber-700/70 text-sm">
            <p>✓ Organiza tareas del hogar</p>
            <p>✓ Gana XP completando misiones</p>
            <p>✓ Lista de compras compartida</p>
            <p>✓ Ranking mensual familiar</p>
          </div>
        </div>

        {/* Botones de acceso */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={() => openDrawer('login')}
            className="bg-amber-700 hover:bg-amber-800 text-white h-12 text-base font-semibold shadow-sm"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={() => openDrawer('register')}
            variant="outline"
            className="border-amber-600 text-amber-700 hover:bg-amber-50 hover:border-amber-700 h-12 text-base font-semibold"
          >
            Crear hogar
          </Button>
          <Button
            onClick={() => openDrawer('join')}
            variant="outline"
            className="border-amber-600 text-amber-700 hover:bg-amber-50 hover:border-amber-700 h-12 text-base font-semibold"
          >
            Unirse con código
          </Button>
        </div>
      </div>

      {/* Drawer controlado */}
      <AuthDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialMode={drawerMode}
      />
    </>
  )
}
