'use client'

import { motion } from 'framer-motion'
import { Check, CheckCircle2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task, Habitant } from '@/lib/types'
import { noteColors, noteColorsBorder } from '@/lib/types'

interface StickyNoteProps {
  task: Task
  assignee: Habitant | undefined
  onComplete: (id: string) => void
  isFiltered: boolean
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

export function StickyNote({ task, assignee, onComplete, isFiltered }: StickyNoteProps) {
  const isEpic = task.difficulty === 'épica'
  const isIntermedia = task.difficulty === 'intermedia'
  const difficulty = difficultyStyles[task.difficulty]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotate: task.rotation }}
      animate={{ 
        opacity: isFiltered ? 0.3 : 1, 
        scale: 1, 
        rotate: task.rotation,
      }}
      exit={{ opacity: 0, scale: 0.5, rotate: task.rotation + 10 }}
      whileHover={{ 
        scale: 1.05, 
        rotate: task.rotation + (task.rotation > 0 ? 2 : -2),
        zIndex: 10,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative w-full max-w-[220px] min-h-[180px] p-4 rounded-sm cursor-pointer',
        'shadow-md hover:shadow-xl transition-shadow duration-200',
        difficulty.borderWidth,
        isEpic ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/40 border-amber-500 epic-note' : noteColors[task.color],
        isEpic ? 'border-amber-500' : (isIntermedia ? `border-purple-500 ${noteColors[task.color]}` : noteColorsBorder[task.color]),
        task.completed && 'grayscale'
      )}
      style={{
        transformOrigin: 'center center',
      }}
    >
      {/* Pin decoration */}
      <div className={cn(
        'absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-sm border-2',
        isEpic ? `${difficulty.pinColor} epic-pin` : difficulty.pinColor
      )} />

      {/* Epic indicator */}
      {isEpic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 flex items-center gap-1"
        >
          <Sparkles className="w-4 h-4 text-yellow-600" />
        </motion.div>
      )}
      
      {/* Completed stamp overlay */}
      {task.completed && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: -15 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="border-4 border-green-600 rounded-lg px-4 py-2 bg-green-100/80">
            <span className="font-handwritten text-2xl text-green-700 font-bold tracking-wide">
              ¡HECHO!
            </span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className={cn('flex flex-col gap-3 mt-2', task.completed && 'opacity-50')}>
        <h3 className={cn(
          'font-handwritten text-xl leading-tight',
          isEpic ? 'font-bold text-amber-900 dark:text-amber-100' : 'font-semibold text-foreground',
          isIntermedia && 'text-purple-900 dark:text-purple-200'
        )}>
          {task.title}
        </h3>
        
        <p className={cn(
          'text-sm leading-relaxed',
          isEpic ? 'text-amber-800 dark:text-amber-200' : (isIntermedia ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground')
        )}>
          {task.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          {assignee && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs font-medium',
                isEpic ? 'bg-amber-200/60 text-amber-900 dark:bg-amber-800/40 dark:text-amber-200' : 'bg-background/60 text-foreground'
              )}
            >
              {assignee.name}
            </Badge>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onComplete(task.id)
            }}
            disabled={task.completed}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              'border-2',
              task.completed 
                ? 'bg-green-500 border-green-600 text-white cursor-not-allowed' 
                : 'bg-background/60 border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 text-muted-foreground hover:text-green-600'
            )}
            aria-label={task.completed ? 'Tarea completada' : 'Marcar como completada'}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
