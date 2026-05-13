'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Check, CheckCircle2, Sparkles, AlertTriangle, CalendarDays, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task, Habitant } from '@/lib/types'
import { noteColors, noteColorsBorder, difficultyXP } from '@/lib/types'

interface StickyNoteProps {
  task: Task
  assignee: Habitant | undefined
  onComplete: (id: string) => void
  isFiltered: boolean
  canEdit?: boolean
  onEdit?: () => void
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

const difficultyStyles = {
  básica: {
    borderWidth: 'border-t-[12px]',
    pinColor: 'bg-red-400 border-red-500',
  },
  intermedia: {
    borderWidth: 'border-t-[16px]',
    pinColor: 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-700',
  },
  épica: {
    borderWidth: 'border-t-[20px]',
    pinColor: 'bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-400 border-blue-600',
  },
}

export function StickyNote({
  task, assignee, onComplete, isFiltered, canEdit, onEdit
}: StickyNoteProps) {
  const shakeControls = useAnimation()
  const [showXP, setShowXP] = useState(false)

  const isEpic = task.difficulty === 'épica'
  const isIntermedia = task.difficulty === 'intermedia'
  const difficulty = difficultyStyles[task.difficulty]
  const xpReward = difficultyXP[task.difficulty]

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.completed) return

    // Shake the card like a real physical post-it
    await shakeControls.start({
      x: [0, -9, 9, -6, 6, -3, 3, 0],
      transition: { duration: 0.38, ease: 'easeOut' },
    })

    // Floating XP reward
    setShowXP(true)
    setTimeout(() => setShowXP(false), 1400)

    onComplete(task.id)
  }

  return (
    // Outer wrapper: owns the shake transform + XP float anchor point
    <motion.div
      animate={shakeControls}
      className="relative w-full"
    >
      {/* Card: visual animations */}
      <motion.div
        initial={{ rotate: task.rotation }}
        animate={{
          opacity: isFiltered ? 0.3 : 1,
          rotate: task.rotation,
        }}
        whileHover={{
          scale: 1.06,
          y: -4,
          rotate: task.rotation + (task.rotation > 0 ? 2 : -2),
          transition: { type: 'spring', stiffness: 420, damping: 22 },
        }}
        transition={{
          type: 'spring',
          stiffness: 340,
          damping: 24,
        }}
        className={cn(
          'group relative w-full min-h-[180px] p-4 rounded-sm cursor-pointer',
          'shadow-md hover:shadow-2xl transition-shadow duration-200',
          difficulty.borderWidth,
          isEpic
            ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/40 border-amber-500 epic-note'
            : noteColors[task.color],
          isEpic
            ? 'border-amber-500'
            : isIntermedia
            ? `border-purple-500 ${noteColors[task.color]}`
            : noteColorsBorder[task.color],
          task.completed && 'grayscale',
        )}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Pin */}
        <div className={cn(
          'absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-sm border-2',
          isEpic ? `${difficulty.pinColor} epic-pin` : difficulty.pinColor,
        )} />

        {/* Edit button (hover) */}
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

        {/* Epic sparkles (behind edit button, same corner) */}
        {isEpic && !canEdit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: staggerDelay + 0.15 }}
            className="absolute top-2 right-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-600" />
          </motion.div>
        )}

        {/* Stamp — slams down like a real rubber stamp */}
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

          {/* Due date indicator */}
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
                  <>
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </>
                )}
                {status === 'ok' && (
                  <>
                    <CalendarDays className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </>
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
              {task.completed
                ? <CheckCircle2 className="w-5 h-5" />
                : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating XP — floats up from the card center and fades out */}
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
