'use client'

import { useState, useEffect, useCallback } from 'react'

interface ItemDB {
  id: string
  hogarId: string
  nombre: string
  comprado: boolean
  agregadoPor: string | null
  createdAt: string
}

export interface ShoppingItem {
  id: string
  nombre: string
  comprado: boolean
  agregadoPor: string | null
  createdAt: Date
}

function itemFromDB(row: ItemDB): ShoppingItem {
  return {
    id: row.id,
    nombre: row.nombre,
    comprado: row.comprado,
    agregadoPor: row.agregadoPor,
    createdAt: new Date(row.createdAt),
  }
}

export function useShoppingList(hogarId: string | null, miPerfilId: string | null) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hogarId) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch('/api/lista-compras')
      .then(res => res.json())
      .then((data: ItemDB[]) => {
        setItems(data.map(itemFromDB))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [hogarId])

  const addItem = useCallback(
    async (nombre: string) => {
      if (!hogarId || !miPerfilId) return
      const res = await fetch('/api/lista-compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      })
      if (res.ok) {
        const data: ItemDB = await res.json()
        setItems(prev => [...prev, itemFromDB(data)])
      }
    },
    [hogarId, miPerfilId]
  )

  const toggleItem = useCallback(async (itemId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === itemId)
      if (!item) return prev
      fetch(`/api/lista-compras/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comprado: !item.comprado }),
      })
      return prev.map(i => i.id === itemId ? { ...i, comprado: !i.comprado } : i)
    })
  }, [])

  const deleteItem = useCallback(async (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId))
    await fetch(`/api/lista-compras/${itemId}`, { method: 'DELETE' })
  }, [])

  const clearComprados = useCallback(async () => {
    setItems(prev => prev.filter(i => !i.comprado))
    await fetch('/api/lista-compras/clear', { method: 'DELETE' })
  }, [])

  return { items, loading, addItem, toggleItem, deleteItem, clearComprados }
}
