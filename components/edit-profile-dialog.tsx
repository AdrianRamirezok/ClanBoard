'use client'

import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AVATARES } from '@/lib/avatars'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentNombre: string
  currentAvatar: string
  onSave: (nombre: string, avatar: string) => Promise<void>
}

export function EditProfileDialog({
  open,
  onOpenChange,
  currentNombre,
  currentAvatar,
  onSave,
}: EditProfileDialogProps) {
  const [nombre, setNombre] = useState(currentNombre)
  const [avatar, setAvatar] = useState(currentAvatar)
  const [saving, setSaving] = useState(false)

  // Sincroniza valores cuando el dialog se abre
  useEffect(() => {
    if (open) {
      setNombre(currentNombre)
      setAvatar(currentAvatar)
    }
  }, [open, currentNombre, currentAvatar])

  const handleSave = async () => {
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await onSave(nombre.trim(), avatar)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-handwritten text-2xl">
            <Pencil className="w-5 h-5 text-primary" />
            Editar perfil
          </DialogTitle>
          <DialogDescription>
            Personaliza tu nombre y avatar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Vista previa del avatar actual */}
          <div className="flex justify-center">
            <Avatar className="w-20 h-20 border-4 border-amber-200 shadow-lg">
              <AvatarImage src={avatar} alt={nombre} />
              <AvatarFallback className="text-2xl font-handwritten">
                {nombre[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Grid de avatares */}
          <div className="space-y-2">
            <Label>Elige tu avatar</Label>
            <div className="grid grid-cols-4 gap-3">
              {AVATARES.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={cn(
                    'rounded-xl p-1.5 border-2 transition-all duration-150',
                    avatar === url
                      ? 'border-amber-500 bg-amber-50 shadow-md scale-105'
                      : 'border-transparent hover:border-amber-200 hover:bg-amber-50/50'
                  )}
                >
                  <Avatar className="w-16 h-16 mx-auto">
                    <AvatarImage src={url} alt={`Avatar ${AVATARES.indexOf(url) + 1}`} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="edit-nombre">Tu nombre</Label>
            <Input
              id="edit-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="font-handwritten text-lg border-amber-200"
              maxLength={30}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !nombre.trim()}
            className="bg-amber-700 hover:bg-amber-800 text-white font-semibold gap-2"
          >
            <Pencil className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
