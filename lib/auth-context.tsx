'use client'

import { createContext, useContext, useState } from 'react'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'

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
  hasProfile: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (params: SignupParams) => Promise<void>
  joinHogar: (params: JoinParams) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [settingUp, setSettingUp] = useState(false)

  const loading = status === 'loading'
  const isLoggedIn = status === 'authenticated'
  const user = session?.user
    ? { id: session.user.id, email: session.user.email }
    : null
  const hasProfile = session?.user?.hasProfile ?? false

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) throw new Error('Email o contraseña incorrectos')
  }

  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/' })
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
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) throw new Error('Error al iniciar sesión tras el registro')
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
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) throw new Error('Error al iniciar sesión tras el registro')
    } finally {
      setSettingUp(false)
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, loading, settingUp, hasProfile, login, loginWithGoogle, signup, joinHogar, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
