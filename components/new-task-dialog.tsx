'use client'

import { useState } from 'react'
import { Plus, Pin, Zap, Crown, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Habitant, Task, TaskDifficulty } from '@/lib/types'
import { noteColors, difficultyXP } from '@/lib/types'
import { useIsMobile } from '@/hooks/use-mobile'

interface NewTaskDialogProps {
  habitants: Habitant[]
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
}

const colorOptions: Array<{ value: Task['color']; label: string }> = [
  { value: 'yellow', label: 'Amarillo' },
  { value: 'pink', label: 'Rosa' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'orange', label: 'Naranja' },
]

const difficultyOptions: Array<{ value: TaskDifficulty; label: string; description: string; icon: React.ReactNode }> = [
  {
    value: 'básica',
    label: 'Básica',
    description: `+${difficultyXP.básica} XP`,
    icon: <div className="w-3 h-3 bg-red-400 rounded-full" />,
  },
  {
    value: 'intermedia',
    label: 'Intermedia',
    description: `+${difficultyXP.intermedia} XP`,
    icon: <Zap className="w-4 h-4 text-purple-600" />,
  },
  {
    value: 'épica',
    label: 'Épica',
    description: `+${difficultyXP.épica} XP`,
    icon: <Crown className="w-4 h-4 text-yellow-600" />,
  },
]

export function NewTaskDialog({ habitants, onAddTask }: NewTaskDialogProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<Task['color']>('yellow')
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty>('básica')
  const [dueDate, setDueDate] = useState<string>('')

  const canSubmit = title.trim() !== '' && selectedAssignee !== ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onAddTask({
      title: title.trim(),
      description: description.trim(),
      assigneeId: selectedAssignee,
      completed: false,
      color: selectedColor,
      rotation: Math.floor(Math.random() * 7) - 3,
      difficulty: selectedDifficulty,
      dueDate: dueDate || null,
    })
    setTitle('')
    setDescription('')
    setSelectedAssignee('')
    setSelectedColor('yellow')
    setSelectedDifficulty('básica')
    setDueDate('')
    setOpen(false)
  }

  // ── Shared form fields ──────────────────────────────────────────────────────

  const fields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Título de la tarea</Label>
        <Input
          id="title"
          placeholder="Ej: Lavar los platos"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-handwritten text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          placeholder="Ej: No olvidar las ollas grandes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-date" className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          Fecha límite
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <input
          id="due-date"
          type="date"
          value={dueDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDueDate(e.target.value)}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'text-foreground [color-scheme:light] dark:[color-scheme:dark]',
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Dificultad / Recompensa</Label>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((opt) => (
            <motion.button
              key={opt.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDifficulty(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                selectedDifficulty === opt.value
                  ? opt.value === 'épica'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : opt.value === 'intermedia'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground/50',
              )}
            >
              <div className="flex items-center gap-1">
                {opt.icon}
                <span className="text-xs font-semibold">{opt.label}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{opt.description}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Responsable</Label>
        <div className="flex flex-wrap gap-2">
          {habitants.map((habitant) => (
            <motion.button
              key={habitant.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAssignee(habitant.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                selectedAssignee === habitant.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={habitant.avatar} alt={habitant.name} />
                <AvatarFallback>{habitant.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{habitant.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color del post-it</Label>
        <div className="flex gap-2">
          {colorOptions.map((color) => (
            <motion.button
              key={color.value}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedColor(color.value)}
              className={cn(
                'w-10 h-10 rounded-lg transition-all',
                noteColors[color.value],
                selectedColor === color.value
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:ring-2 hover:ring-muted-foreground/30',
              )}
              title={color.label}
              aria-label={color.label}
            />
          ))}
        </div>
      </div>
    </>
  )

  // ── FAB trigger ────────────────────────────────────────────────────────────

  const fab = (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setOpen(true)}
      className={cn(
        'fixed bottom-8 right-8 w-16 h-16 rounded-full',
        'bg-primary text-primary-foreground shadow-lg',
        'flex items-center justify-center',
        'hover:shadow-xl transition-shadow duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      )}
      aria-label="Pinchar Tarea"
    >
      <Plus className="w-7 h-7" />
    </motion.button>
  )

  // ── Mobile: bottom sheet (Drawer) ──────────────────────────────────────────

  if (isMobile) {
    return (
      <>
        {fab}
        <Drawer open={open} onOpenChange={setOpen}>
          {/* h-[90dvh] overrides vaul's h-auto so flex-1 children work correctly */}
          <DrawerContent className="h-[90dvh]">
            <DrawerHeader className="shrink-0 text-left px-4 pb-2">
              <DrawerTitle className="flex items-center gap-2 font-handwritten text-2xl">
                <Pin className="w-5 h-5 text-primary" />
                Pinchar Tarea
              </DrawerTitle>
              <DrawerDescription>
                Añade una nueva tarea al tablero familiar
              </DrawerDescription>
            </DrawerHeader>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-4 space-y-5 pb-2">
                {fields}
              </div>

              <DrawerFooter className="shrink-0 pt-3">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Pin className="w-4 h-4" />
                  Pinchar
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  // ── Desktop: centered modal (Dialog) ──────────────────────────────────────

  return (
    <>
      {fab}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg flex flex-col p-0 gap-0"
          style={{ maxHeight: '90dvh' }}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2 font-handwritten text-2xl">
              <Pin className="w-5 h-5 text-primary" />
              Pinchar Tarea
            </DialogTitle>
            <DialogDescription>
              Añade una nueva tarea al tablero familiar
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">
              {fields}
            </div>

            <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t bg-background">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Pin className="w-4 h-4" />
                Pinchar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
