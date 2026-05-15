'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote } from './sticky-note'
import { EditTaskDialog, type TaskEdits } from './edit-task-dialog'
import type { Task, Habitant } from '@/lib/types'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: -15, scale: 0.88 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

// ── Sound ────────────────────────────────────────────────────────────────────

function playCrumpleSound() {
  try {
    const AudioCtxClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtxClass()
    const now = ctx.currentTime

    const bufLen = Math.floor(ctx.sampleRate * 0.4)
    const noiseBuffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufLen; i++) noiseData[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.setValueAtTime(3000, now)
    bpf.frequency.exponentialRampToValueAtTime(300, now + 0.4)
    bpf.Q.value = 1.5

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.4, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    noise.connect(bpf)
    bpf.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.4)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, now + 0.38)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.58)

    const plopGain = ctx.createGain()
    plopGain.gain.setValueAtTime(0.001, now + 0.38)
    plopGain.gain.linearRampToValueAtTime(0.5, now + 0.40)
    plopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58)

    osc.connect(plopGain)
    plopGain.connect(ctx.destination)
    osc.start(now + 0.38)
    osc.stop(now + 0.58)

    setTimeout(() => ctx.close(), 900)
  } catch {
    // AudioContext unavailable (SSR, sandboxed iframe, etc.)
  }
}

// ── TaskBoard ────────────────────────────────────────────────────────────────

interface TaskBoardProps {
  tasks: Task[]
  habitants: Habitant[]
  filteredAssignee: string | null
  onCompleteTask: (id: string) => void
  onEditTask: (taskId: string, edits: TaskEdits) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  miPerfilId: string | null
  esAdmin: boolean
}

export function TaskBoard({ tasks, habitants, filteredAssignee, onCompleteTask, onEditTask, onDeleteTask, miPerfilId, esAdmin }: TaskBoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const getAssignee = (assigneeId: string) => habitants.find(h => h.id === assigneeId)

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <>
      <div
        className="flex-1 p-8 overflow-auto"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(194, 167, 125, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(194, 167, 125, 0.08) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover, cover, 200px 200px',
        }}
      >
        <div className="mb-8">
          <h2 className="font-handwritten text-3xl font-bold text-foreground mb-2">
            Tablero de Tareas
          </h2>
          <p className="text-muted-foreground">
            {tasks.filter(t => !t.completed).length} tareas pendientes • {tasks.filter(t => t.completed).length} completadas
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => {
              const canEdit = esAdmin || task.assigneeId === miPerfilId
              return (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.35, ease: 'easeIn' } }}
                  whileHover={{ zIndex: 10 }}
                  className="w-full max-w-[220px]"
                >
                  <StickyNote
                    task={task}
                    assignee={getAssignee(task.assigneeId)}
                    onComplete={onCompleteTask}
                    isFiltered={filteredAssignee !== null && task.assigneeId !== filteredAssignee}
                    canEdit={canEdit}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => { playCrumpleSound(); onDeleteTask(task.id) }}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="font-handwritten text-4xl text-muted-foreground mb-4">🎉</div>
            <h3 className="font-handwritten text-2xl text-foreground mb-2">¡No hay tareas!</h3>
            <p className="text-muted-foreground">Usa el botón + para añadir la primera tarea</p>
          </div>
        )}
      </div>

      {editingTask && (
        <EditTaskDialog
          open={editingTask !== null}
          onOpenChange={(open) => { if (!open) setEditingTask(null) }}
          task={editingTask}
          habitants={habitants}
          onSave={onEditTask}
        />
      )}
    </>
  )
}
