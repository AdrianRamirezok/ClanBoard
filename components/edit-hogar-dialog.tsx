'use client'

import { useState, useEffect } from 'react'
import { Home } from 'lucide-react'
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

interface EditHogarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentNombre: string
  onSave: (nombre: string) => Promise<void>
}

export function EditHogarDialog({
  open,
  onOpenChange,
  currentNombre,
  onSave,
}: EditHogarDialogProps) {
  const [nombre, setNombre] = useState(currentNombre)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setNombre(currentNombre)
  }, [open, currentNombre])

  const handleSave = async () => {
    const trimmed = nombre.trim()
    if (!trimmed || trimmed.length > 30) return
    setSaving(true)
    try {
      await onSave(trimmed)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-handwritten text-2xl">
            <Home className="w-5 h-5 text-primary" />
            Editar nombre del hogar
          </DialogTitle>
          <DialogDescription>
            Solo el administrador puede cambiar el nombre del hogar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="edit-hogar-nombre">Nombre del hogar</Label>
          <Input
            id="edit-hogar-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del hogar"
            className="mt-2 font-handwritten text-lg border-amber-200"
            maxLength={30}
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {nombre.trim().length}/30
          </p>
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
            disabled={saving || !nombre.trim() || nombre.trim().length > 30}
            className="bg-amber-700 hover:bg-amber-800 text-white font-semibold"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
