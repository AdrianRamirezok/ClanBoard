'use client'

import { useState } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { HomeSidebar } from './home-sidebar'
import { useAuth } from '@/lib/auth-context'
import type { Habitant } from '@/lib/types'

interface MobileHeaderProps {
  habitants: Habitant[]
}

export function MobileHeader({ habitants }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <>
      <header className="md:hidden h-16 bg-background border-b border-border px-4 flex items-center justify-between">
        <div>
          <h1 className="font-handwritten text-2xl font-bold text-foreground">HomeBoard</h1>
          <p className="text-xs text-muted-foreground">Tablero Familiar</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <div onClick={() => setIsOpen(false)}>
            <HomeSidebar habitants={habitants} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
