'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SetupMode = 'elegir' | 'crear' | 'unirse'

export function HogarSetupSheet() {
  const { update } = useSession()
  const [mode, setMode] = useState<SetupMode>('elegir')
  const [nombreHogar, setNombreHogar] = useState('')
  const [nombrePerfil, setNombrePerfil] = useState('')
  const [codigoInvitacion, setCodigoInvitacion] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const url = mode === 'crear' ? '/api/setup/crear-hogar' : '/api/setup/unirse'
      const body =
        mode === 'crear'
          ? { nombreHogar, nombrePerfil }
          : { codigoInvitacion, nombrePerfil }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al configurar el hogar')
      }

      // Refresh the NextAuth session so hasProfile becomes true
      await update()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏠</div>
          <h1 className="font-handwritten text-3xl font-bold text-amber-900">¡Bienvenido!</h1>
          <p className="text-amber-600 text-sm mt-1">Ya casi estás listo. Configura tu hogar.</p>
        </div>

        {mode === 'elegir' && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setMode('crear')}
              className="bg-amber-700 hover:bg-amber-800 text-white h-12 text-base font-semibold"
            >
              Crear un nuevo hogar
            </Button>
            <Button
              onClick={() => setMode('unirse')}
              variant="outline"
              className="border-amber-600 text-amber-700 hover:bg-amber-50 h-12 text-base font-semibold"
            >
              Unirse con código de invitación
            </Button>
          </div>
        )}

        {mode !== 'elegir' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => { setMode('elegir'); setError('') }}
              className="text-xs text-amber-500 hover:text-amber-700 mb-2"
            >
              ← Volver
            </button>

            {mode === 'crear' && (
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Nombre del hogar
                </label>
                <Input
                  type="text"
                  value={nombreHogar}
                  onChange={e => setNombreHogar(e.target.value)}
                  placeholder="Casa García"
                  required
                  disabled={submitting}
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
            )}

            {mode === 'unirse' && (
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Código de invitación
                </label>
                <Input
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
            )}

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Tu nombre
              </label>
              <Input
                type="text"
                value={nombrePerfil}
                onChange={e => setNombrePerfil(e.target.value)}
                placeholder="Adrián"
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
              {submitting
                ? mode === 'crear' ? 'Creando hogar...' : 'Uniéndose...'
                : mode === 'crear' ? 'Crear hogar' : 'Unirse al hogar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
