'use client'

import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  user: { email: string; name: string } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)

  const login = async (email: string, password: string) => {
    // Simulate login - in production, call your API
    if (email && password.length >= 6) {
      const name = email.split('@')[0]
      setUser({ email, name })
      setIsLoggedIn(true)
    } else {
      throw new Error('Email inválido o contraseña muy corta')
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
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
