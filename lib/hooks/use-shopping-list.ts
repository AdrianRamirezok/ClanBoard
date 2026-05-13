'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ItemDB {
  id: string
  hogar_id: string
  nombre: string
  comprado: boolean
  agregado_por: string | null
  created_at: string
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
    agregadoPor: row.agregado_por,
    createdAt: new Date(row.created_at),
  }
}

export function useShoppingList(hogarId: string | null, miPerfilId: string | null) {
  const supabase = useMemo(() => createClient(), [])
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hogarId) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('lista_compras')
      .select('*')
      .eq('hogar_id', hogarId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setItems((data ?? []).map(d => itemFromDB(d as ItemDB)))
        setLoading(false)
      })
  }, [hogarId, supabase])

  const addItem = useCallback(
    async (nombre: string) => {
      if (!hogarId || !miPerfilId) return
      const { data, error } = await supabase
        .from('lista_compras')
        .insert({ hogar_id: hogarId, nombre: nombre.trim(), agregado_por: miPerfilId, comprado: false })
        .select()
        .single()
      if (!error && data) {
        setItems(prev => [...prev, itemFromDB(data as ItemDB)])
      }
    },
    [hogarId, miPerfilId, supabase]
  )

  const toggleItem = useCallback(
    async (itemId: string) => {
      setItems(prev => {
        const item = prev.find(i => i.id === itemId)
        if (!item) return prev
        supabase
          .from('lista_compras')
          .update({ comprado: !item.comprado })
          .eq('id', itemId)
          .then(() => {})
        return prev.map(i => i.id === itemId ? { ...i, comprado: !i.comprado } : i)
      })
    },
    [supabase]
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      setItems(prev => prev.filter(i => i.id !== itemId))
      await supabase.from('lista_compras').delete().eq('id', itemId)
    },
    [supabase]
  )

  const clearComprados = useCallback(
    async () => {
      setItems(prev => {
        const ids = prev.filter(i => i.comprado).map(i => i.id)
        if (ids.length > 0) {
          supabase.from('lista_compras').delete().in('id', ids).then(() => {})
        }
        return prev.filter(i => !i.comprado)
      })
    },
    [supabase]
  )

  return { items, loading, addItem, toggleItem, deleteItem, clearComprados }
}
