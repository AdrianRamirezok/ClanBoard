'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type AuthMode = 'login' | 'register' | 'join'

interface AuthDrawerProps {
  open: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export function AuthDrawer({ open, onClose, initialMode = 'login' }: AuthDrawerProps) {
  const { login, signup, joinHogar } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreHogar, setNombreHogar] = useState('')
  const [nombrePerfil, setNombrePerfil] = useState('')
  const [codigoInvitacion, setCodigoInvitacion] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Cuando el drawer se abre, cambia al modo pedido y limpia errores
  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setError('')
    }
  }, [open, initialMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else if (mode === 'register') {
        await signup({ email, password, nombreHogar, nombrePerfil })
      } else {
        await joinHogar({ email, password, nombrePerfil, codigoInvitacion })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError('')
  }

  const tabClass = (m: AuthMode) =>
    `flex-1 py-2 text-sm font-medium transition-colors rounded-none first:rounded-l-md last:rounded-r-md ${
      mode === m
        ? 'bg-amber-700 text-white'
        : 'bg-white text-amber-700 hover:bg-amber-50'
    }`

  const modeLabel = {
    login: 'Iniciar sesión',
    register: 'Crear hogar',
    join: 'Unirse con código',
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
              <p className="text-amber-700 text-sm mt-1">{modeLabel[mode]}</p>
            </div>

            <div className="flex-1 px-8 py-8">
              {/* Cabecera desktop */}
              <div className="hidden md:block mb-7 pr-8">
                <h2 className="font-handwritten text-3xl font-bold text-amber-900">{modeLabel[mode]}</h2>
                <p className="text-amber-600 text-sm mt-1">
                  {mode === 'login' ? 'Accede a tu hogar familiar'
                    : mode === 'register' ? 'Crea un nuevo hogar para tu familia'
                    : 'Únete al hogar de alguien con su código'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex rounded-md overflow-hidden border border-amber-200 mb-6">
                <button type="button" onClick={() => switchMode('login')} className={tabClass('login')}>
                  Iniciar sesión
                </button>
                <button type="button" onClick={() => switchMode('register')} className={tabClass('register')}>
                  Crear hogar
                </button>
                <button type="button" onClick={() => switchMode('join')} className={tabClass('join')}>
                  Unirse
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campos de "Crear hogar" */}
                {mode === 'register' && (
                  <>
                    <div>
                      <label htmlFor="nombreHogar" className="block text-sm font-medium text-amber-900 mb-1">
                        Nombre del hogar
                      </label>
                      <Input
                        id="nombreHogar"
                        type="text"
                        value={nombreHogar}
                        onChange={e => setNombreHogar(e.target.value)}
                        placeholder="Casa Ramírez"
                        required
                        disabled={submitting}
                        className="border-amber-200 focus-visible:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="nombrePerfil" className="block text-sm font-medium text-amber-900 mb-1">
                        Tu nombre
                      </label>
                      <Input
                        id="nombrePerfil"
                        type="text"
                        value={nombrePerfil}
                        onChange={e => setNombrePerfil(e.target.value)}
                        placeholder="Adrián"
                        required
                        disabled={submitting}
                        className="border-amber-200 focus-visible:ring-amber-400"
                      />
                    </div>
                  </>
                )}

                {/* Campos de "Unirse con código" */}
                {mode === 'join' && (
                  <>
                    <div>
                      <label htmlFor="codigoInvitacion" className="block text-sm font-medium text-amber-900 mb-1">
                        Código de invitación
                      </label>
                      <Input
                        id="codigoInvitacion"
                        type="text"
                        value={codigoInvitacion}
                        onChange={e => setCodigoInvitacion(e.target.value.toUpperCase())}
                        placeholder="XXXXXXXX"
                        required
                        disabled={submitting}
                        className="border-amber-200 font-mono tracking-widest text-center text-lg focus-visible:ring-amber-400"
                        maxLength={8}
                      />
                    </div>
                    <div>
                      <label htmlFor="nombrePerfilJoin" className="block text-sm font-medium text-amber-900 mb-1">
                        Tu nombre
                      </label>
                      <Input
                        id="nombrePerfilJoin"
                        type="text"
                        value={nombrePerfil}
                        onChange={e => setNombrePerfil(e.target.value)}
                        placeholder="María"
                        required
                        disabled={submitting}
                        className="border-amber-200 focus-visible:ring-amber-400"
                      />
                    </div>
                  </>
                )}

                {/* Email y contraseña — siempre visibles */}
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

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-1">
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
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
                  {submitting
                    ? mode === 'register' ? 'Creando hogar...'
                    : mode === 'join' ? 'Uniéndose...'
                    : 'Entrando...'
                    : mode === 'login' ? 'Entrar'
                    : mode === 'register' ? 'Crear hogar'
                    : 'Unirse al hogar'}
                </Button>
              </form>
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
