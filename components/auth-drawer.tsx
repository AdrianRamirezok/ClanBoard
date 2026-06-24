'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// AuthMode se mantiene por compatibilidad con app/page.tsx.
// El drawer ya no distingue modos: siempre ofrece Google + Magic Link.
// La creación / unión a un hogar se maneja en hogar-setup-sheet.tsx tras el login.
export type AuthMode = 'login' | 'register' | 'join'

interface AuthDrawerProps {
  open: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export function AuthDrawer({ open, onClose }: AuthDrawerProps) {
  const { loginWithGoogle, loginWithMagicLink } = useAuth()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // Al abrir el drawer, limpia el estado
  useEffect(() => {
    if (open) {
      setEmail('')
      setError('')
      setSent(false)
      setSubmitting(false)
    }
  }, [open])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await loginWithMagicLink(email)
      if (res?.error) {
        setError('No se pudo enviar el link. Verificá el email e intentá de nuevo.')
        return
      }
      setSent(true)
    } catch {
      setError('Error inesperado al enviar el link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera móvil */}
            <div className="md:hidden bg-gradient-to-br from-amber-50 to-orange-100 px-8 pt-10 pb-5 text-center">
              <h1 className="font-handwritten text-4xl font-bold text-amber-900">ClanBoard</h1>
              <p className="text-amber-700 text-sm mt-1">Entrá a tu hogar</p>
            </div>

            <div className="flex-1 px-8 py-8">
              {/* Cabecera desktop */}
              <div className="hidden md:block mb-7 pr-8">
                <h2 className="font-handwritten text-3xl font-bold text-amber-900">Entrar</h2>
                <p className="text-amber-600 text-sm mt-1">
                  Accedé con Google o pedí un link mágico a tu email
                </p>
              </div>

              {/* Opción A: Google */}
              <Button
                type="button"
                variant="outline"
                onClick={() => loginWithGoogle()}
                className="w-full border-amber-200 text-amber-900 hover:bg-amber-50 h-11 gap-2"
              >
                <GoogleIcon />
                Continuar con Google
              </Button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-amber-500">o con un magic link</span>
                </div>
              </div>

              {/* Opción B: Magic Link */}
              {sent ? (
                <div className="text-center space-y-3 py-2">
                  <div className="text-4xl">📬</div>
                  <p className="text-amber-900 font-medium">Revisá tu email</p>
                  <p className="text-amber-600 text-sm">
                    Te enviamos un link para entrar a <strong>{email}</strong>. Abrilo desde este
                    dispositivo para iniciar sesión.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSent(false); setError('') }}
                    className="text-xs text-amber-600 hover:text-amber-800 underline transition-colors"
                  >
                    Usar otro email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={submitting}
                      className="border-amber-200 focus-visible:ring-amber-400"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-md text-sm border bg-red-50 border-red-200 text-red-700">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold h-11"
                  >
                    {submitting ? 'Enviando...' : 'Enviar link'}
                  </Button>
                </form>
              )}
            </div>

            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-amber-600/50">Tu hogar, tus reglas 🏡</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
