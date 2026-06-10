'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { Task, Habitant, TaskDifficulty } from '@/lib/types'
import { difficultyXP } from '@/lib/types'
import { AVATARES } from '@/lib/avatars'

// ── Tipos que reflejan los modelos de Prisma/MongoDB ──────────────────────────

interface PerfilDB {
  id: string
  userId: string
  hogarId: string
  nombre: string
  rol: 'admin' | 'miembro'
  avatar: string | null
  xp: number
  xpMensual: number
  createdAt: string
}

export interface HogarDB {
  id: string
  nombre: string
  codigoInvitacion: string
  createdAt: string
}

interface TareaDB {
  id: string
  hogarId: string
  titulo: string
  descripcion: string | null
  asignadoA: string | null
  completada: boolean
  xpValor: number
  color: string | null
  fechaLimite: string | null
  createdAt: string
}

// ── Helpers de conversión DB → UI ────────────────────────────────────────────

function xpToDifficulty(xp: number): TaskDifficulty {
  if (xp >= difficultyXP['épica']) return 'épica'
  if (xp >= difficultyXP['intermedia']) return 'intermedia'
  return 'básica'
}

function deriveRotation(id: string): number {
  const last = id.charCodeAt(id.length - 1)
  return (last % 7) - 3
}

function perfilToHabitant(p: PerfilDB): Habitant {
  return {
    id: p.id,
    name: p.nombre,
    avatar: p.avatar ?? AVATARES[0],
    xp: p.xp,
    xpMensual: p.xpMensual ?? 0,
  }
}

function tareaToTask(t: TareaDB): Task {
  return {
    id: t.id,
    title: t.titulo,
    description: t.descripcion ?? '',
    assigneeId: t.asignadoA ?? '',
    completed: t.completada,
    color: (t.color as Task['color']) ?? 'yellow',
    rotation: deriveRotation(t.id),
    createdAt: new Date(t.createdAt),
    difficulty: xpToDifficulty(t.xpValor),
    dueDate: t.fechaLimite ?? null,
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface DashboardState {
  habitants: Habitant[]
  tasks: Task[]
  hogar: HogarDB | null
  esAdmin: boolean
  miPerfilId: string | null
  loading: boolean
  error: string | null
}

export function useDashboard() {
  const { user } = useAuth()

  const [hogarId, setHogarId] = useState<string | null>(null)
  const [state, setState] = useState<DashboardState>({
    habitants: [],
    tasks: [],
    hogar: null,
    esAdmin: false,
    miPerfilId: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!user?.id) return

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }))

      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) {
          const err = await res.json()
          const msg = err.error === 'Perfil no encontrado'
            ? 'No se encontró perfil. El hogar no fue creado correctamente. Cierra sesión y regístrate de nuevo.'
            : err.error || 'Error al cargar datos'
          setState(s => ({ ...s, loading: false, error: msg }))
          return
        }

        const { perfil, hogar, perfiles, tareas } = await res.json()

        setHogarId(perfil.hogarId)
        setState({
          hogar,
          esAdmin: perfil.rol === 'admin',
          miPerfilId: perfil.id,
          habitants: (perfiles as PerfilDB[]).map(perfilToHabitant),
          tasks: (tareas as TareaDB[]).map(tareaToTask),
          loading: false,
          error: null,
        })
      } catch {
        setState(s => ({ ...s, loading: false, error: 'Error de conexión al cargar datos' }))
      }
    }

    load()
  }, [user?.id])

  const completeTask = useCallback(
    async (taskId: string) => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task || task.completed) return

      const xpReward = difficultyXP[task.difficulty]

      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
        habitants: prev.habitants.map(h =>
          h.id === task.assigneeId
            ? { ...h, xp: h.xp + xpReward, xpMensual: h.xpMensual + xpReward }
            : h
        ),
      }))

      await fetch(`/api/tareas/${taskId}/completar`, { method: 'POST' })
    },
    [state.tasks]
  )

  const addTask = useCallback(
    async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
      if (!hogarId) return

      const res = await fetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: newTask.title,
          descripcion: newTask.description || null,
          asignadoA: newTask.assigneeId || null,
          xpValor: difficultyXP[newTask.difficulty],
          color: newTask.color,
          fechaLimite: newTask.dueDate ?? null,
        }),
      })

      if (!res.ok) {
        console.error('[addTask] Error:', res.status)
        return
      }

      const data: TareaDB = await res.json()
      setState(prev => ({
        ...prev,
        tasks: [tareaToTask(data), ...prev.tasks],
      }))
    },
    [hogarId]
  )

  const editTask = useCallback(
    async (
      taskId: string,
      edits: {
        title: string
        description: string
        assigneeId: string
        color: Task['color']
        difficulty: TaskDifficulty
        dueDate?: string | null
      }
    ) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, ...edits } : t)),
      }))

      await fetch(`/api/tareas/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: edits.title,
          descripcion: edits.description || null,
          asignadoA: edits.assigneeId || null,
          xpValor: difficultyXP[edits.difficulty],
          color: edits.color,
          fechaLimite: edits.dueDate ?? null,
        }),
      })
    },
    []
  )

  const deleteTask = useCallback(async (taskId: string) => {
    const res = await fetch(`/api/tareas/${taskId}`, { method: 'DELETE' })
    if (!res.ok) {
      console.error('[deleteTask] Error:', res.status)
      return
    }
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }))
  }, [])

  const updatePerfil = useCallback(
    async (nombre: string, avatar: string) => {
      if (!state.miPerfilId) return

      setState(prev => ({
        ...prev,
        habitants: prev.habitants.map(h =>
          h.id === prev.miPerfilId ? { ...h, name: nombre, avatar } : h
        ),
      }))

      await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, avatar }),
      })
    },
    [state.miPerfilId]
  )

  const updateHogarNombre = useCallback(
    async (nombre: string) => {
      if (!state.hogar) return

      setState(prev =>
        prev.hogar ? { ...prev, hogar: { ...prev.hogar, nombre } } : prev
      )

      await fetch(`/api/hogares/${state.hogar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      })
    },
    [state.hogar]
  )

  const regenerarCodigo = useCallback(async () => {
    if (!state.hogar) return

    const res = await fetch(`/api/hogares/${state.hogar.id}/regenerar-codigo`, {
      method: 'POST',
    })
    if (!res.ok) {
      console.error('Error regenerando código:', res.status)
      return
    }

    const { codigo } = await res.json()
    setState(prev =>
      prev.hogar ? { ...prev, hogar: { ...prev.hogar, codigoInvitacion: codigo } } : prev
    )
  }, [state.hogar])

  return { ...state, completeTask, addTask, editTask, deleteTask, updatePerfil, updateHogarNombre, regenerarCodigo }
}
