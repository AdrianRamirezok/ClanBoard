'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export interface AuthUser {
  id: string
  email: string
}

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
  user: AuthUser | null
  loading: boolean
  settingUp: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (params: SignupParams) => Promise<void>
  joinHogar: (params: JoinParams) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingUp, setSettingUp] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error al iniciar sesión')
    }
    const { user: userData } = await res.json()
    setUser(userData)
  }

  const signup = async ({ email, password, nombreHogar, nombrePerfil }: SignupParams) => {
    setSettingUp(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mode: 'crear', nombreHogar, nombrePerfil }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al crear el hogar')
      }
      const { user: userData } = await res.json()
      setUser(userData)
    } finally {
      setSettingUp(false)
    }
  }

  const joinHogar = async ({ email, password, nombrePerfil, codigoInvitacion }: JoinParams) => {
    setSettingUp(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mode: 'unirse', nombrePerfil, codigoInvitacion }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al unirse al hogar')
      }
      const { user: userData } = await res.json()
      setUser(userData)
    } finally {
      setSettingUp(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
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
