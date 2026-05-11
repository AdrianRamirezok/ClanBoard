'use client'

import { useState } from 'react'
import { Plus, Pin, Zap, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
    icon: <div className="w-3 h-3 bg-red-400 rounded-full" />
  },
  { 
    value: 'intermedia', 
    label: 'Intermedia', 
    description: `+${difficultyXP.intermedia} XP`,
    icon: <Zap className="w-4 h-4 text-purple-600" />
  },
  { 
    value: 'épica', 
    label: 'Épica', 
    description: `+${difficultyXP.épica} XP`,
    icon: <Crown className="w-4 h-4 text-yellow-600" />
  },
]

export function NewTaskDialog({ habitants, onAddTask }: NewTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<Task['color']>('yellow')
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty>('básica')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !selectedAssignee) return

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      assigneeId: selectedAssignee,
      completed: false,
      color: selectedColor,
      rotation: Math.floor(Math.random() * 7) - 3, // -3 to 3 degrees
      difficulty: selectedDifficulty,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setSelectedAssignee('')
    setSelectedColor('yellow')
    setSelectedDifficulty('básica')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'fixed bottom-8 right-8 w-16 h-16 rounded-full',
            'bg-primary text-primary-foreground shadow-lg',
            'flex items-center justify-center',
            'hover:shadow-xl transition-shadow duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          aria-label="Pinchar Tarea"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-handwritten text-2xl">
            <Pin className="w-5 h-5 text-primary" />
            Pinchar Tarea
          </DialogTitle>
          <DialogDescription>
            Añade una nueva tarea al tablero familiar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Title */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder="Ej: No olvidar las ollas grandes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Dificultad / Recompensa</Label>
            <div className="grid grid-cols-3 gap-2">
              {difficultyOptions.map((difficulty) => (
                <motion.button
                  key={difficulty.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                  <span className="text-xs text-muted-foreground font-mono">
                    {difficulty.description}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Assignee */}
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
                      : 'border-border hover:border-primary/50'
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

          {/* Color */}
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
                      : 'hover:ring-2 hover:ring-muted-foreground/30'
                  )}
                  title={color.label}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !selectedAssignee}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Pin className="w-4 h-4" />
              Pinchar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

