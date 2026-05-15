'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Check, CheckCircle2, Sparkles, AlertTriangle, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task, Habitant } from '@/lib/types'
import { noteColors, noteColorsBorder, difficultyXP } from '@/lib/types'

// ── Constants ────────────────────────────────────────────────────────────────

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`

const CARD_BG_IMAGE = `radial-gradient(ellipse 95% 85% at 50% 38%, transparent 35%, rgba(0,0,0,0.045) 100%), ${PAPER_TEXTURE}`
const CARD_BG_SIZE  = 'cover, 200px 200px'

const BASE_FILTER  = 'drop-shadow(4px 5px 8px rgba(0,0,0,0.16)) drop-shadow(-2px 3px 5px rgba(0,0,0,0.09)) drop-shadow(2px 14px 8px rgba(0,0,0,0.09))'
const HOVER_FILTER = 'drop-shadow(6px 8px 14px rgba(0,0,0,0.22)) drop-shadow(-3px 4px 7px rgba(0,0,0,0.11)) drop-shadow(4px 20px 12px rgba(0,0,0,0.11))'

const difficultyStyles = {
  básica:     { borderWidth: 'border-t-[12px]', pinGradient: 'radial-gradient(circle at 36% 30%, #fca5a5, #b91c1c)' },
  intermedia: { borderWidth: 'border-t-[16px]', pinGradient: 'radial-gradient(circle at 36% 30%, #dbb8fe, #6d28d9)' },
  épica:      { borderWidth: 'border-t-[20px]', pinGradient: 'radial-gradient(circle at 36% 30%, #93c5fd, #1e40af)' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface StickyNoteProps {
  task: Task
  assignee: Habitant | undefined
  onComplete: (id: string) => void
  isFiltered: boolean
  canEdit?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

type DueDateStatus = 'ok' | 'warning' | 'overdue'

function getDueDateStatus(dueDate: string): DueDateStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 2) return 'warning'
  return 'ok'
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

// ── Component ────────────────────────────────────────────────────────────────

export function StickyNote({
  task, assignee, onComplete, isFiltered, canEdit, onEdit, onDelete
}: StickyNoteProps) {
  const shakeControls = useAnimation()
  const [showXP, setShowXP] = useState(false)

  const isEpic       = task.difficulty === 'épica'
  const isIntermedia = task.difficulty === 'intermedia'
  const difficulty   = difficultyStyles[task.difficulty]
  const xpReward     = difficultyXP[task.difficulty]

  // Epic cards skip the drop-shadow; epic-glow CSS animation owns box-shadow.
  const baseFilter  = isEpic ? (task.completed ? 'grayscale(1)' : 'none')
                             : (task.completed ? `grayscale(1) ${BASE_FILTER}` : BASE_FILTER)
  const hoverFilter = isEpic ? (task.completed ? 'grayscale(1)' : 'none')
                             : (task.completed ? `grayscale(1) ${HOVER_FILTER}` : HOVER_FILTER)

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.completed) return

    await shakeControls.start({
      x: [0, -9, 9, -6, 6, -3, 3, 0],
      transition: { duration: 0.38, ease: 'easeOut' },
    })

    setShowXP(true)
    setTimeout(() => setShowXP(false), 1400)

    onComplete(task.id)
  }

  return (
    <motion.div animate={shakeControls} className="relative w-full">

      <motion.div
        className="group relative"
        initial={{ rotate: task.rotation }}
        animate={{
          opacity: isFiltered ? 0.3 : 1,
          rotate: task.rotation,
          filter: baseFilter,
        }}
        whileHover={{
          scale: 1.06,
          y: -4,
          rotate: task.rotation + (task.rotation > 0 ? 2 : -2),
          filter: hoverFilter,
          transition: { type: 'spring', stiffness: 420, damping: 22 },
        }}
        transition={{ type: 'spring', stiffness: 340, damping: 24 }}
        style={{ transformOrigin: 'center center' }}
      >


        <div
          className={cn(
            'relative w-full min-h-[180px] p-4 cursor-pointer',
            difficulty.borderWidth,
            isEpic
              ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/40 border-amber-500 epic-note'
              : noteColors[task.color],
            isEpic
              ? 'border-amber-500'
              : isIntermedia
              ? `border-purple-500 ${noteColors[task.color]}`
              : noteColorsBorder[task.color],
          )}
          style={{
            borderRadius: '2px 3px 4px 2px / 3px 2px 3px 4px',
            backgroundImage: isEpic ? undefined : CARD_BG_IMAGE,
            backgroundSize:  isEpic ? undefined : CARD_BG_SIZE,
          }}
        >

          {/* Ruled lines */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 38, left: 14, right: 14, bottom: 30,
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(0,0,0,0.05) 23px, rgba(0,0,0,0.05) 24px)',
              pointerEvents: 'none',
            }}
          />

          {/* Pin — wrapper at top:-14 so sphere sticks above the card edge */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -14, left: '50%',
              transform: 'translateX(-50%)',
              width: 20,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Cast shadow on note surface */}
            <div style={{
              position: 'absolute',
              top: 26, left: '50%',
              transform: 'translateX(-40%)',
              width: 18, height: 7,
              background: 'rgba(0,0,0,0.22)',
              filter: 'blur(3px)',
              borderRadius: '50%',
            }} />

            {/* Sphere head */}
            <div
              className={cn(isEpic && 'epic-pin')}
              style={{
                width: 20, height: 20,
                borderRadius: '50%',
                background: difficulty.pinGradient,
                boxShadow: isEpic
                  ? undefined
                  : '0 4px 8px rgba(0,0,0,0.5), 0 2px 3px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.55)',
                position: 'relative', zIndex: 2,
              }}
            />

            {/* Needle */}
            <div style={{
              position: 'absolute',
              top: 17, left: '50%',
              transform: 'translateX(-50%)',
              width: 3, height: 16,
              background: 'linear-gradient(to right, #d4d4d4 0%, #8a8a8a 50%, #c0c0c0 100%)',
              borderRadius: '1px 1px 2px 2px',
              zIndex: 1,
            }} />
          </div>

          {/* Edit button — pending tasks, hover only */}
          {canEdit && !task.completed && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.() }}
              title="Editar tarea"
              className={cn(
                'absolute top-2 right-2 z-20 p-1 rounded-full',
                'bg-background/80 shadow-sm border border-border/50',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'hover:bg-background hover:scale-110',
              )}
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          )}

          {/* Delete button — completed tasks, hover only */}
          {canEdit && task.completed && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.() }}
              title="Eliminar tarea"
              className={cn(
                'absolute top-2 right-2 z-20 p-1 rounded-full',
                'bg-background/80 shadow-sm border border-border/50',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 hover:scale-110',
              )}
            >
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
            </button>
          )}

          {/* Epic sparkles */}
          {isEpic && !canEdit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute top-2 right-2 z-20"
            >
              <Sparkles className="w-4 h-4 text-yellow-600" />
            </motion.div>
          )}

          {/* Stamp */}
          {task.completed && (
            <motion.div
              initial={{ scale: 1.6, opacity: 0, y: -16, rotate: -15 }}
              animate={{ scale: 1,   opacity: 1, y: 0,   rotate: -15 }}
              transition={{ type: 'spring', stiffness: 580, damping: 20, mass: 0.7 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div className="border-4 border-green-600 rounded-lg px-4 py-2 bg-green-100/80">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-handwritten text-2xl text-green-700 font-bold tracking-wide"
                >
                  ¡HECHO!
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className={cn('flex flex-col gap-3 mt-2', task.completed && 'opacity-50')}>
            <h3 className={cn(
              'font-handwritten text-xl leading-tight',
              isEpic ? 'font-bold text-amber-900 dark:text-amber-100' : 'font-semibold text-foreground',
              isIntermedia && 'text-purple-900 dark:text-purple-200',
            )}>
              {task.title}
            </h3>

            <p className={cn(
              'text-sm leading-relaxed',
              isEpic
                ? 'text-amber-800 dark:text-amber-200'
                : isIntermedia
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-muted-foreground',
            )}>
              {task.description}
            </p>

            {/* Due date */}
            {task.dueDate && !task.completed && (() => {
              const status = getDueDateStatus(task.dueDate)
              return (
                <div className={cn(
                  'flex items-center gap-1 text-xs font-medium rounded-md px-1.5 py-0.5 w-fit',
                  status === 'overdue' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                  status === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
                  status === 'ok'      && 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
                )}>
                  {status === 'overdue' && <span>Vencida</span>}
                  {status === 'warning' && (
                    <><AlertTriangle className="w-3 h-3 flex-shrink-0" /><span>{formatDueDate(task.dueDate)}</span></>
                  )}
                  {status === 'ok' && (
                    <><CalendarDays className="w-3 h-3 flex-shrink-0" /><span>{formatDueDate(task.dueDate)}</span></>
                  )}
                </div>
              )
            })()}

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-auto pt-2">
              {assignee && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    isEpic
                      ? 'bg-amber-200/60 text-amber-900 dark:bg-amber-800/40 dark:text-amber-200'
                      : 'bg-background/60 text-foreground',
                  )}
                >
                  {assignee.name}
                </Badge>
              )}

              <button
                onClick={handleComplete}
                disabled={task.completed}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border-2',
                  task.completed
                    ? 'bg-green-500 border-green-600 text-white cursor-not-allowed'
                    : 'bg-background/60 border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 text-muted-foreground hover:text-green-600 active:scale-90',
                )}
                aria-label={task.completed ? 'Tarea completada' : 'Marcar como completada'}
              >
                {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>{/* end card */}


      </motion.div>{/* end rotation wrapper */}

      {/* Floating XP */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none z-50"
            initial={{ opacity: 1, y: 0, scale: 0.75 }}
            animate={{ opacity: 0, y: -65, scale: 1.15 }}
            exit={{}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="font-handwritten font-bold text-[22px] select-none"
              style={{
                color: '#f59e0b',
                textShadow: '0 0 14px rgba(245,158,11,0.65), 0 2px 4px rgba(0,0,0,0.25)',
              }}
            >
              +{xpReward} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
