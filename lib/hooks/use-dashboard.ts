'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import type { Task, Habitant, TaskDifficulty } from '@/lib/types'
import { difficultyXP } from '@/lib/types'
import { AVATARES } from '@/lib/avatars'

// ── Tipos que reflejan las filas de Supabase ─────────────────────────────────

interface PerfilDB {
  id: string
  user_id: string
  hogar_id: string
  nombre: string
  rol: 'admin' | 'miembro'
  avatar: string | null
  xp: number
  xp_mensual: number
  created_at: string
}

export interface HogarDB {
  id: string
  nombre: string
  codigo_invitacion: string
  created_at: string
}

interface TareaDB {
  id: string
  hogar_id: string
  titulo: string
  descripcion: string | null
  asignado_a: string | null
  completada: boolean
  xp_valor: number
  color: string | null
  fecha_limite: string | null
  created_at: string
}

// ── Helpers de conversión DB → UI ────────────────────────────────────────────

function xpToDifficulty(xp: number): TaskDifficulty {
  if (xp >= difficultyXP['épica']) return 'épica'
  if (xp >= difficultyXP['intermedia']) return 'intermedia'
  return 'básica'
}

function deriveRotation(id: string): number {
  const last = id.charCodeAt(id.length - 1)
  return (last % 7) - 3 // -3 a 3 grados
}

function perfilToHabitant(p: PerfilDB): Habitant {
  return {
    id: p.id,
    name: p.nombre,
    avatar: p.avatar ?? AVATARES[0],
    xp: p.xp,
    xpMensual: p.xp_mensual ?? 0,
  }
}

function tareaToTask(t: TareaDB): Task {
  return {
    id: t.id,
    title: t.titulo,
    description: t.descripcion ?? '',
    assigneeId: t.asignado_a ?? '',
    completed: t.completada,
    color: (t.color as Task['color']) ?? 'yellow',
    rotation: deriveRotation(t.id),
    createdAt: new Date(t.created_at),
    difficulty: xpToDifficulty(t.xp_valor),
    dueDate: t.fecha_limite ?? null,
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
  const supabase = useMemo(() => createClient(), [])

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
    if (!user) return

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }))

      console.log('[Dashboard] Cargando datos para user.id:', user!.id)

      // 1. Perfil del usuario actual
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()

      console.log('[Dashboard] perfil:', perfil, '| error:', perfilError)

      if (perfilError) {
        setState(s => ({ ...s, loading: false, error: `Error al leer perfil: ${perfilError.message} (${perfilError.code})` }))
        return
      }
      if (!perfil) {
        setState(s => ({ ...s, loading: false, error: 'No se encontró perfil. El hogar no fue creado correctamente. Cierra sesión y regístrate de nuevo.' }))
        return
      }

      // 2. Hogar
      const { data: hogar, error: hogarError } = await supabase
        .from('hogares')
        .select('*')
        .eq('id', perfil.hogar_id)
        .single()

      if (hogarError || !hogar) {
        setState(s => ({ ...s, loading: false, error: 'No se encontró el hogar.' }))
        return
      }

      // 3. Todos los perfiles del hogar (para la lista de habitantes)
      const { data: perfiles, error: perfilesError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('hogar_id', perfil.hogar_id)
        .order('xp', { ascending: false })

      if (perfilesError) {
        setState(s => ({ ...s, loading: false, error: 'Error cargando habitantes.' }))
        return
      }

      // 4. Tareas del hogar
      const { data: tareas, error: tareasError } = await supabase
        .from('tareas')
        .select('*')
        .eq('hogar_id', perfil.hogar_id)
        .order('created_at', { ascending: false })

      if (tareasError) {
        setState(s => ({ ...s, loading: false, error: 'Error cargando tareas.' }))
        return
      }

      setHogarId(perfil.hogar_id)
      setState({
        hogar,
        esAdmin: perfil.rol === 'admin',
        miPerfilId: perfil.id,
        habitants: (perfiles ?? []).map(perfilToHabitant),
        tasks: (tareas ?? []).map(tareaToTask),
        loading: false,
        error: null,
      })
    }

    load()
  }, [user, supabase])

  const completeTask = useCallback(
    async (taskId: string) => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task || task.completed) return

      const xpReward = difficultyXP[task.difficulty]
      const habitant = state.habitants.find(h => h.id === task.assigneeId)

      // Actualización optimista
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId ? { ...t, completed: true } : t
        ),
        habitants: prev.habitants.map(h =>
          h.id === task.assigneeId
            ? { ...h, xp: h.xp + xpReward, xpMensual: h.xpMensual + xpReward }
            : h
        ),
      }))

      // Persistir en Supabase
      await supabase.from('tareas').update({ completada: true }).eq('id', taskId)

      if (habitant) {
        await supabase
          .from('perfiles')
          .update({
            xp: habitant.xp + xpReward,
            xp_mensual: habitant.xpMensual + xpReward,
          })
          .eq('id', task.assigneeId)
      }
    },
    [state.tasks, state.habitants, supabase]
  )

  const addTask = useCallback(
    async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
      if (!hogarId) return

      const { data, error } = await supabase
        .from('tareas')
        .insert({
          hogar_id: hogarId,
          titulo: newTask.title,
          descripcion: newTask.description || null,
          asignado_a: newTask.assigneeId || null,
          completada: false,
          xp_valor: difficultyXP[newTask.difficulty],
          color: newTask.color,
          fecha_limite: newTask.dueDate ?? null,
        })
        .select()
        .single()

      if (error || !data) {
        console.error('Error al crear tarea:', error)
        return
      }

      setState(prev => ({
        ...prev,
        tasks: [tareaToTask(data as TareaDB), ...prev.tasks],
      }))
    },
    [hogarId, supabase]
  )

  const updatePerfil = useCallback(
    async (nombre: string, avatar: string) => {
      if (!state.miPerfilId) return

      // Actualización optimista
      setState(prev => ({
        ...prev,
        habitants: prev.habitants.map(h =>
          h.id === prev.miPerfilId ? { ...h, name: nombre, avatar } : h
        ),
      }))

      await supabase
        .from('perfiles')
        .update({ nombre, avatar })
        .eq('id', state.miPerfilId)
    },
    [state.miPerfilId, supabase]
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

      await supabase
        .from('tareas')
        .update({
          titulo: edits.title,
          descripcion: edits.description || null,
          asignado_a: edits.assigneeId || null,
          xp_valor: difficultyXP[edits.difficulty],
          color: edits.color,
          fecha_limite: edits.dueDate ?? null,
        })
        .eq('id', taskId)
    },
    [supabase]
  )

  const updateHogarNombre = useCallback(
    async (nombre: string) => {
      if (!state.hogar) return

      setState(prev =>
        prev.hogar ? { ...prev, hogar: { ...prev.hogar, nombre } } : prev
      )

      await supabase
        .from('hogares')
        .update({ nombre })
        .eq('id', state.hogar.id)
    },
    [state.hogar, supabase]
  )

  const regenerarCodigo = useCallback(async () => {
    if (!state.hogar) return
    const { data, error } = await supabase.rpc('regenerar_codigo_invitacion', {
      p_hogar_id: state.hogar.id,
    })
    if (error) {
      console.error('Error regenerando código:', error)
      return
    }
    setState(prev =>
      prev.hogar ? { ...prev, hogar: { ...prev.hogar, codigo_invitacion: data as string } } : prev
    )
  }, [state.hogar, supabase])

  return { ...state, completeTask, addTask, editTask, updatePerfil, updateHogarNombre, regenerarCodigo }
}
