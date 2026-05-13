'use client'

import { useState, useEffect } from 'react'
import { Pencil, Zap, Crown, CalendarDays } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Habitant, Task, TaskDifficulty } from '@/lib/types'
import { noteColors, difficultyXP } from '@/lib/types'

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

export type TaskEdits = {
  title: string
  description: string
  assigneeId: string
  color: Task['color']
  difficulty: TaskDifficulty
  dueDate?: string | null
}

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  habitants: Habitant[]
  onSave: (taskId: string, edits: TaskEdits) => Promise<void>
}

export function EditTaskDialog({ open, onOpenChange, task, habitants, onSave }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [selectedAssignee, setSelectedAssignee] = useState(task.assigneeId)
  const [selectedColor, setSelectedColor] = useState<Task['color']>(task.color)
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty>(task.difficulty)
  const [dueDate, setDueDate] = useState<string>(task.dueDate ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setDescription(task.description)
      setSelectedAssignee(task.assigneeId)
      setSelectedColor(task.color)
      setSelectedDifficulty(task.difficulty)
      setDueDate(task.dueDate ?? '')
    }
  }, [open, task])

  const handleSave = async () => {
    if (!title.trim() || !selectedAssignee) return
    setSaving(true)
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim(),
        assigneeId: selectedAssignee,
        color: selectedColor,
        difficulty: selectedDifficulty,
        dueDate: dueDate || null,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-handwritten text-2xl">
            <Pencil className="w-5 h-5 text-primary" />
            Editar Tarea
          </DialogTitle>
          <DialogDescription>
            Modifica los datos de la tarea
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título de la tarea</Label>
            <Input
              id="edit-title"
              placeholder="Ej: Lavar los platos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-handwritten text-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción (opcional)</Label>
            <Input
              id="edit-description"
              placeholder="Ej: No olvidar las ollas grandes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label htmlFor="edit-due-date" className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              Fecha límite
              <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <input
              id="edit-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2',
                'text-foreground [color-scheme:light] dark:[color-scheme:dark]'
              )}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Dificultad / Recompensa</Label>
            <div className="grid grid-cols-3 gap-2">
              {difficultyOptions.map((difficulty) => (
                <button
                  key={difficulty.value}
                  type="button"
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                    selectedDifficulty === difficulty.value
                      ? difficulty.value === 'épica'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : difficulty.value === 'intermedia'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <div className="flex items-center gap-1">
                    {difficulty.icon}
                    <span className="text-xs font-semibold">{difficulty.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{difficulty.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Responsable</Label>
            <div className="flex flex-wrap gap-2">
              {habitants.map((habitant) => (
                <button
                  key={habitant.id}
                  type="button"
                  onClick={() => setSelectedAssignee(habitant.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                    selectedAssignee === habitant.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={habitant.avatar} alt={habitant.name} />
                    <AvatarFallback>{habitant.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{habitant.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color del post-it</Label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-all',
                    noteColors[color.value],
                    selectedColor === color.value
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:ring-2 hover:ring-muted-foreground/30'
                  )}
                  title={color.label}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !selectedAssignee}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Pencil className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
