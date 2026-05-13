'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type Mode = 'login' | 'register' | 'join'

export function LoginPage() {
  const { login, signup, joinHogar } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreHogar, setNombreHogar] = useState('')
  const [nombrePerfil, setNombrePerfil] = useState('')
  const [codigoInvitacion, setCodigoInvitacion] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registroExitoso, setRegistroExitoso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else if (mode === 'register') {
        await signup({ email, password, nombreHogar, nombrePerfil })
        setRegistroExitoso(true)
      } else {
        await joinHogar({ email, password, nombrePerfil, codigoInvitacion })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setRegistroExitoso(false)
  }

  const tabClass = (m: Mode) =>
    `flex-1 py-2 text-sm font-medium transition-colors ${
      mode === m
        ? 'bg-amber-700 text-white'
        : 'bg-white text-amber-700 hover:bg-amber-50'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-2 border-amber-200">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-handwritten font-bold text-amber-900 mb-2">
              HomeBoard
            </h1>
            <p className="text-amber-700">Tu tablero familiar</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-amber-200 mb-6">
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

          {/* Confirmación de registro */}
          {registroExitoso ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm text-center space-y-2">
              <p className="font-semibold text-base">¡Hogar creado!</p>
              <p>Revisa tu bandeja de entrada y confirma tu email para poder iniciar sesión.</p>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-2 text-amber-700 underline text-sm"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Campos exclusivos de "Crear hogar" */}
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
                      disabled={loading}
                      className="border-amber-200"
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
                      disabled={loading}
                      className="border-amber-200"
                    />
                  </div>
                </>
              )}

              {/* Campos exclusivos de "Unirse con código" */}
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
                      disabled={loading}
                      className="border-amber-200 font-mono tracking-widest text-center text-lg"
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
                      disabled={loading}
                      className="border-amber-200"
                    />
                  </div>
                </>
              )}

              {/* Email y contraseña (siempre visibles) */}
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
                  disabled={loading}
                  className="border-amber-200"
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
                  disabled={loading}
                  className="border-amber-200"
                />
              </div>

              {error && (
                <div className={`p-3 rounded text-sm border ${
                  error.toLowerCase().includes('confirma') || error.toLowerCase().includes('revisa')
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold"
              >
                {loading
                  ? '...'
                  : mode === 'login'
                  ? 'Entrar'
                  : mode === 'register'
                  ? 'Crear hogar'
                  : 'Unirse al hogar'}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
