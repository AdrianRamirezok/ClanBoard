'use client'

import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface SignupParams {
  email: string
  password: string
  nombreHogar: string
  nombrePerfil: string
}

interface JoinParams {
  email: string
  password: string
  nombrePerfil: string
  codigoInvitacion: string
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  loading: boolean
  settingUp: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (params: SignupParams) => Promise<void>
  joinHogar: (params: JoinParams) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingUp, setSettingUp] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Escuchar cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const signup = async ({ email, password, nombreHogar, nombrePerfil }: SignupParams) => {
    // settingUp bloquea el dashboard mientras el RPC aún no terminó,
    // evitando que useDashboard cargue antes de que exista el perfil.
    setSettingUp(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
          throw new Error('Demasiados intentos. Espera unos minutos o desactiva la confirmación de email en Supabase para desarrollo.')
        }
        throw new Error(error.message)
      }
      if (!data.user) throw new Error('No se pudo crear el usuario')

      // Si no hay sesión (email confirmation activado), iniciamos sesión explícitamente.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          throw new Error('Cuenta creada. Revisa tu email y confirma tu cuenta para continuar.')
        }
      }

      const { error: rpcError } = await supabase.rpc('crear_hogar_con_admin', {
        p_user_id: data.user.id,
        p_nombre_hogar: nombreHogar,
        p_nombre_perfil: nombrePerfil,
      })
      if (rpcError) throw new Error(rpcError.message)
    } finally {
      setSettingUp(false)
    }
  }

  const joinHogar = async ({ email, password, nombrePerfil, codigoInvitacion }: JoinParams) => {
    setSettingUp(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
          throw new Error('Demasiados intentos. Espera unos minutos e intenta de nuevo.')
        }
        throw new Error(error.message)
      }
      if (!data.user) throw new Error('No se pudo crear el usuario')

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw new Error('Cuenta creada. Revisa tu email y confirma tu cuenta para continuar.')
      }

      const { error: rpcError } = await supabase.rpc('unirse_al_hogar', {
        p_user_id: data.user.id,
        p_codigo: codigoInvitacion.trim(),
        p_nombre_perfil: nombrePerfil,
      })
      if (rpcError) throw new Error(rpcError.message)
    } finally {
      setSettingUp(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, loading, settingUp, login, signup, joinHogar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
