'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Habitant } from '@/lib/types'

interface MonthlyRankingProps {
  habitants: Habitant[]
}

// Display order: [2nd-left, 1st-center, 3rd-right]
// barDelay: 3rd rises first (0s), then 2nd (0.15s), then 1st (0.30s)
const PODIUM_SLOTS = [
  {
    sortedIndex: 1,
    label: '🥈',
    platformH: 'h-20',
    platformW: 'w-24',
    avatarCls: 'w-16 h-16',
    borderCls: 'border-slate-300 dark:border-slate-500',
    platformCls: 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500',
    rankNum: '2',
    barDelay: 0.15,
    isFirst: false,
  },
  {
    sortedIndex: 0,
    label: '👑',
    platformH: 'h-32',
    platformW: 'w-28',
    avatarCls: 'w-20 h-20',
    borderCls: 'border-amber-400 dark:border-amber-500',
    platformCls: 'bg-gradient-to-t from-amber-500 to-amber-300 dark:from-amber-700 dark:to-amber-500',
    rankNum: '1',
    barDelay: 0.30,
    isFirst: true,
  },
  {
    sortedIndex: 2,
    label: '🥉',
    platformH: 'h-14',
    platformW: 'w-24',
    avatarCls: 'w-14 h-14',
    borderCls: 'border-orange-300 dark:border-orange-500',
    platformCls: 'bg-gradient-to-t from-orange-500 to-orange-300 dark:from-orange-700 dark:to-orange-500',
    rankNum: '3',
    barDelay: 0,
    isFirst: false,
  },
]

const VIEWPORT = { once: true, amount: 0.2 as const }

export function MonthlyRanking({ habitants }: MonthlyRankingProps) {
  const sorted = [...habitants].sort((a, b) => b.xpMensual - a.xpMensual)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1)

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h2 className="font-handwritten text-3xl font-bold text-foreground">Ranking Mensual</h2>
          </div>
          <p className="text-muted-foreground text-sm">{mesCapitalizado}</p>
        </motion.div>

        {habitants.length === 0 ? (
          <p className="text-center font-handwritten text-xl text-muted-foreground">No hay miembros en el hogar</p>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 md:gap-5 mb-10">
              {PODIUM_SLOTS.map((slot) => {
                const habitant = top3[slot.sortedIndex]
                if (!habitant) return null

                const contentDelay = slot.barDelay + 0.45
                const crownDelay = slot.barDelay + 0.72

                return (
                  <div key={slot.sortedIndex} className="flex flex-col items-center">

                    {/* Avatar + name + XP — fade in after bar rises */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={VIEWPORT}
                      transition={{ delay: contentDelay, duration: 0.4, ease: 'easeOut' }}
                      className="flex flex-col items-center mb-2"
                    >
                      {/* Crown (1st) gets its own scale+glow animation; medals are static */}
                      {slot.isFirst ? (
                        <motion.span
                          className="text-2xl mb-1 inline-block"
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={VIEWPORT}
                          transition={{
                            delay: crownDelay,
                            type: 'spring',
                            stiffness: 380,
                            damping: 10,
                          }}
                          style={{
                            filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.85))',
                            transformOrigin: 'center bottom',
                          }}
                        >
                          👑
                        </motion.span>
                      ) : (
                        <span className="text-2xl mb-1">{slot.label}</span>
                      )}

                      <Avatar className={cn(slot.avatarCls, 'border-4 shadow-lg mb-2', slot.borderCls)}>
                        <AvatarImage src={habitant.avatar} alt={habitant.name} />
                        <AvatarFallback className="font-handwritten font-bold text-lg">
                          {habitant.name[0]}
                        </AvatarFallback>
                      </Avatar>

                      <p className="font-handwritten font-bold text-sm text-foreground truncate max-w-[90px] text-center leading-tight">
                        {habitant.name}
                      </p>
                      <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                        {habitant.xpMensual} XP
                      </p>
                    </motion.div>

                    {/* Platform bar — rises from bottom */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={VIEWPORT}
                      style={{ transformOrigin: 'bottom' }}
                      transition={{
                        delay: slot.barDelay,
                        type: 'spring',
                        stiffness: slot.isFirst ? 180 : 260,
                        damping: slot.isFirst ? 14 : 22,
                      }}
                      className={cn(
                        'rounded-t-xl flex items-center justify-center shadow-inner',
                        slot.platformH, slot.platformW, slot.platformCls,
                      )}
                    >
                      <span className="font-handwritten font-bold text-3xl text-white/90 drop-shadow">
                        {slot.rankNum}
                      </span>
                    </motion.div>
                  </div>
                )
              })}
            </div>

            {/* Remaining members */}
            {rest.length > 0 && (
              <div className="space-y-2">
                <p className="font-handwritten text-base text-muted-foreground text-center mb-4">
                  Resto del hogar
                </p>
                {rest.map((habitant, index) => (
                  <motion.div
                    key={habitant.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <span className="font-handwritten font-bold text-muted-foreground w-7 text-center flex-shrink-0">
                      #{index + 4}
                    </span>
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage src={habitant.avatar} alt={habitant.name} />
                      <AvatarFallback>{habitant.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm flex-1 truncate">{habitant.name}</p>
                    <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 flex-shrink-0">
                      {habitant.xpMensual} XP
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {sorted.every(h => h.xpMensual === 0) && (
              <p className="text-center text-muted-foreground text-sm mt-4">
                Aún no hay XP acumulado este mes. ¡Completa tareas para subir en el ranking!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
