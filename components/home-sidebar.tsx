'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Trophy, Home, LogOut, Copy, Check, RefreshCw, Link, Pencil, SquarePen } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { Habitant } from '@/lib/types'
import type { HogarDB } from '@/lib/hooks/use-dashboard'
import { EditProfileDialog } from './edit-profile-dialog'
import { EditHogarDialog } from './edit-hogar-dialog'

interface HomeSidebarProps {
  habitants: Habitant[]
  hogarNombre?: string
  hogar?: HogarDB | null
  esAdmin?: boolean
  miPerfilId?: string | null
  onRegenerarCodigo?: () => Promise<void>
  onUpdatePerfil?: (nombre: string, avatar: string) => Promise<void>
  onUpdateHogarNombre?: (nombre: string) => Promise<void>
}

export function HomeSidebar({
  habitants,
  hogarNombre,
  hogar,
  esAdmin,
  miPerfilId,
  onRegenerarCodigo,
  onUpdatePerfil,
  onUpdateHogarNombre,
}: HomeSidebarProps) {
  const { logout } = useAuth()
  const [copied, setCopied] = useState(false)
  const [regenerando, setRegenerando] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editHogarOpen, setEditHogarOpen] = useState(false)

  const totalXP = habitants.reduce((sum, h) => sum + h.xp, 0)
  const sortedHabitants = [...habitants].sort((a, b) => b.xp - a.xp)
  const miHabitant = habitants.find(h => h.id === miPerfilId)

  const handleCopy = async () => {
    if (!hogar?.codigo_invitacion) return
    await navigator.clipboard.writeText(hogar.codigo_invitacion.toUpperCase())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerar = async () => {
    if (!onRegenerarCodigo) return
    setRegenerando(true)
    try { await onRegenerarCodigo() } finally { setRegenerando(false) }
  }

  return (
    <>
      <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
        {/* Fixed Header */}
        <div className="p-6 flex-shrink-0 border-b border-sidebar-border">
          {/* Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-sidebar-border mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 group/hogar">
                <h1 className="font-handwritten text-2xl font-bold text-sidebar-foreground truncate">
                  {hogarNombre ?? 'HomeBoard'}
                </h1>
                {esAdmin && onUpdateHogarNombre && (
                  <button
                    onClick={() => setEditHogarOpen(true)}
                    title="Editar nombre del hogar"
                    className="opacity-0 group-hover/hogar:opacity-100 transition-opacity p-1 rounded hover:bg-sidebar-accent flex-shrink-0"
                  >
                    <SquarePen className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Tablero Familiar</p>
            </div>
          </div>

          {/* XP del Hogar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">XP del Hogar</span>
            </div>
            <div className="font-handwritten text-4xl font-bold text-amber-700 dark:text-amber-300">
              {totalXP}
            </div>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">¡Sigan así, equipo!</p>
          </motion.div>

          {/* Código de invitación */}
          {hogar && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-amber-200 dark:border-amber-800 p-3 bg-amber-50/50 dark:bg-amber-900/10"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Link className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Código de invitación
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-base font-bold text-amber-700 dark:text-amber-300 tracking-widest flex-1">
                  {hogar.codigo_invitacion.toUpperCase()}
                </code>
                <button onClick={handleCopy} title="Copiar código" className="p-1 rounded hover:bg-amber-200/60 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
                </button>
                {esAdmin && (
                  <button onClick={handleRegenerar} disabled={regenerando} title="Regenerar código" className="p-1 rounded hover:bg-amber-200/60 transition-colors disabled:opacity-50">
                    <RefreshCw className={cn('w-4 h-4 text-amber-600', regenerando && 'animate-spin')} />
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/60 mt-1">
                {esAdmin ? 'Comparte este código para invitar miembros' : 'Código de tu hogar'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Scrollable Habitantes */}
        <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground mb-4 flex items-center gap-2 flex-shrink-0">
            <Star className="w-4 h-4 text-amber-500" />
            Habitantes
          </h2>

          <div className="overflow-y-auto space-y-3 scrollbar-hide">
            {sortedHabitants.map((habitant, index) => {
              const esMiPerfil = habitant.id === miPerfilId
              return (
                <motion.div
                  key={habitant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors flex-shrink-0',
                    'hover:bg-sidebar-accent/50',
                    index === 0 && 'bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50',
                    esMiPerfil && 'cursor-pointer group'
                  )}
                  onClick={esMiPerfil ? (e) => { e.stopPropagation(); setEditOpen(true) } : undefined}
                  title={esMiPerfil ? 'Editar tu perfil' : undefined}
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
                    {/* Icono de edición visible en hover para el perfil propio */}
                    {esMiPerfil && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm text-sidebar-foreground truncate">
                        {habitant.name}
                      </p>
                      {esMiPerfil && (
                        <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{habitant.xp} XP</span>
                  </div>

                  <div className="text-lg font-handwritten text-muted-foreground flex-shrink-0">
                    #{index + 1}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-sidebar-border space-y-4">
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

          <Button onClick={() => logout()} variant="outline" className="w-full mt-2 border-sidebar-border hover:bg-sidebar-accent">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Modal de edición de perfil */}
      {miHabitant && onUpdatePerfil && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          currentNombre={miHabitant.name}
          currentAvatar={miHabitant.avatar}
          onSave={onUpdatePerfil}
        />
      )}

      {/* Modal de edición del hogar */}
      {esAdmin && hogar && onUpdateHogarNombre && (
        <EditHogarDialog
          open={editHogarOpen}
          onOpenChange={setEditHogarOpen}
          currentNombre={hogar.nombre}
          onSave={onUpdateHogarNombre}
        />
      )}
    </>
  )
}
