'use client'

import { motion } from 'framer-motion'
import { Star, Trophy, Home, LogOut } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { Habitant } from '@/lib/types'

interface HomeSidebarProps {
  habitants: Habitant[]
}

export function HomeSidebar({ habitants }: HomeSidebarProps) {
  const { logout } = useAuth()
  const totalXP = habitants.reduce((sum, h) => sum + h.xp, 0)
  const sortedHabitants = [...habitants].sort((a, b) => b.xp - a.xp)

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="p-6 flex-shrink-0 border-b border-sidebar-border">
        {/* Logo / Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-sidebar-border mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-handwritten text-2xl font-bold text-sidebar-foreground">
              HomeBoard
            </h1>
            <p className="text-xs text-muted-foreground">Tablero Familiar</p>
          </div>
        </div>

        {/* XP del Hogar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">XP del Hogar</span>
          </div>
          <div className="font-handwritten text-4xl font-bold text-amber-700 dark:text-amber-300">
            {totalXP}
          </div>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
            ¡Sigan así, equipo!
          </p>
        </motion.div>
      </div>

      {/* Scrollable Habitantes Section */}
      <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground mb-4 flex items-center gap-2 flex-shrink-0">
          <Star className="w-4 h-4 text-amber-500" />
          Habitantes
        </h2>
        
        <div className="overflow-y-auto space-y-3 scrollbar-hide">
          {sortedHabitants.map((habitant, index) => (
            <motion.div
              key={habitant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors flex-shrink-0',
                'hover:bg-sidebar-accent/50',
                index === 0 && 'bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50'
              )}
            >
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-background shadow-sm flex-shrink-0">
                  <AvatarImage src={habitant.avatar} alt={habitant.name} />
                  <AvatarFallback>{habitant.name[0]}</AvatarFallback>
                </Avatar>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-background">
                    <Trophy className="w-3 h-3 text-amber-800" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-sidebar-foreground truncate">
                  {habitant.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{habitant.xp} XP</span>
                </div>
              </div>
              
              <div className="text-lg font-handwritten text-muted-foreground flex-shrink-0">
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 p-6 border-t border-sidebar-border space-y-4">
        {/* Avatar Stack */}
        <div>
          <p className="text-xs text-muted-foreground mb-3">En casa hoy</p>
          <div className="flex -space-x-3">
            {habitants.map((habitant, index) => (
              <motion.div
                key={habitant.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Avatar className="w-9 h-9 border-2 border-sidebar ring-2 ring-sidebar">
                  <AvatarImage src={habitant.avatar} alt={habitant.name} />
                  <AvatarFallback>{habitant.name[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          className="w-full mt-2 border-sidebar-border hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
