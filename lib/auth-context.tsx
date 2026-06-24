'use client'

import { createContext, useContext, useMemo } from 'react'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'

export interface AuthUser {
  id: string
  email: string
}

// Resultado simplificado de signIn('resend', { redirect: false })
interface MagicLinkResult {
  error?: string | null
  ok?: boolean
  status?: number
  url?: string | null
}

interface AuthContextType {
  isLoggedIn: boolean
  user: AuthUser | null
  loading: boolean
  settingUp: boolean
  hasProfile: boolean
  loginWithGoogle: () => Promise<void>
  loginWithMagicLink: (email: string) => Promise<MagicLinkResult | undefined>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const loading = status === 'loading'
  const isLoggedIn = status === 'authenticated'

  // Memoized so consumers' useEffect([user]) only fires when id/email actually changes,
  // not on every re-render of AuthContextInner.
  const user = useMemo(
    () =>
      session?.user?.id
        ? { id: session.user.id, email: session.user.email ?? '' }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.user?.id, session?.user?.email]
  )

  const hasProfile = session?.user?.hasProfile ?? false

  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/' })
  }

  const loginWithMagicLink = async (email: string): Promise<MagicLinkResult | undefined> => {
    return signIn('resend', { email, redirect: false })
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        settingUp: false,
        hasProfile,
        loginWithGoogle,
        loginWithMagicLink,
        logout,
      }}
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
