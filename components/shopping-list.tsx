'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Trash2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Habitant } from '@/lib/types'
import type { ShoppingItem } from '@/lib/hooks/use-shopping-list'

interface ShoppingListProps {
  items: ShoppingItem[]
  loading: boolean
  esAdmin: boolean
  habitants: Habitant[]
  onAddItem: (nombre: string) => Promise<void>
  onToggleItem: (id: string) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  onClearComprados: () => Promise<void>
}

export function ShoppingList({
  items,
  loading,
  esAdmin,
  habitants,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onClearComprados,
}: ShoppingListProps) {
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)
  const [clearing, setClearing] = useState(false)

  const getHabitantName = (perfilId: string | null) =>
    habitants.find(h => h.id === perfilId)?.name ?? 'Alguien'

  const compradosCount = items.filter(i => i.comprado).length
  const pendingCount = items.length - compradosCount

  const handleAdd = async () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      await onAddItem(trimmed)
      setNewItem('')
    } finally {
      setAdding(false)
    }
  }

  const handleClear = async () => {
    setClearing(true)
    try { await onClearComprados() } finally { setClearing(false) }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-6 h-6 text-amber-600" />
            <h2 className="font-handwritten text-3xl font-bold text-foreground">Lista de Compras</h2>
          </div>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} · {compradosCount} en el carrito
            </p>
          )}
        </motion.div>

        {/* Add item */}
        <div className="flex gap-2 mb-6">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Añadir ítem a la lista..."
            className="font-medium"
            maxLength={60}
            disabled={adding}
          />
          <Button
            onClick={handleAdd}
            disabled={!newItem.trim() || adding}
            className="bg-amber-700 hover:bg-amber-800 text-white px-4 flex-shrink-0"
            aria-label="Añadir ítem"
          >
            {adding
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-14 h-14 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-handwritten text-xl text-muted-foreground">La lista está vacía</p>
            <p className="text-sm text-muted-foreground mt-1">Añade el primer ítem arriba</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border bg-card transition-colors',
                    item.comprado && 'bg-muted/40 border-border/40'
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className={cn(
                      'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      item.comprado
                        ? 'bg-green-500 border-green-500'
                        : 'border-border hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    )}
                    aria-label={item.comprado ? 'Desmarcar' : 'Marcar como comprado'}
                  >
                    {item.comprado && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {/* Name + added by */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate leading-tight',
                      item.comprado && 'line-through text-muted-foreground'
                    )}>
                      {item.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      por {getHabitantName(item.agregadoPor)}
                    </p>
                  </div>

                  {/* Delete — admin only */}
                  {esAdmin && (
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                      aria-label="Eliminar ítem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Limpiar comprados */}
        <AnimatePresence>
          {compradosCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={clearing}
                className="w-full text-muted-foreground border-dashed hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                {clearing
                  ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  : <Trash2 className="w-4 h-4 mr-2" />}
                Limpiar comprados ({compradosCount})
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
