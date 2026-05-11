export interface Habitant {
  id: string
  name: string
  avatar: string
  xp: number
}

export type TaskDifficulty = 'básica' | 'intermedia' | 'épica'

export interface Task {
  id: string
  title: string
  description: string
  assigneeId: string
  completed: boolean
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange'
  rotation: number
  createdAt: Date
  difficulty: TaskDifficulty
}

export const noteColors = {
  yellow: 'bg-note-yellow',
  pink: 'bg-note-pink',
  blue: 'bg-note-blue',
  green: 'bg-note-green',
  orange: 'bg-note-orange',
} as const

export const noteColorsBorder = {
  yellow: 'border-amber-300',
  pink: 'border-pink-300',
  blue: 'border-blue-300',
  green: 'border-emerald-300',
  orange: 'border-orange-300',
} as const

export const difficultyXP = {
  básica: 10,
  intermedia: 50,
  épica: 200,
} as const
