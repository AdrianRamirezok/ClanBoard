'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LayoutGrid, Trophy, ShoppingCart } from 'lucide-react'
import { HomeSidebar } from './home-sidebar'
import { MobileHeader } from './mobile-header'
import { AvatarFilter } from './avatar-filter'
import { TaskBoard } from './task-board'
import { MonthlyRanking } from './monthly-ranking'
import { ShoppingList } from './shopping-list'
import { NewTaskDialog } from './new-task-dialog'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import { useShoppingList } from '@/lib/hooks/use-shopping-list'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function HomeBoard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { logout } = useAuth()
  const { habitants, tasks, hogar, esAdmin, miPerfilId, loading, error, completeTask, addTask, editTask, updatePerfil, updateHogarNombre, regenerarCodigo } = useDashboard()

  const filteredAssigneeFromUrl = searchParams.get('resident') || null
  const [filteredAssignee, setFilteredAssignee] = useState<string | null>(filteredAssigneeFromUrl)
  const [activeTab, setActiveTab] = useState<'board' | 'ranking' | 'lista'>('board')

  const { items: listaItems, loading: loadingLista, addItem, toggleItem, deleteItem, clearComprados } =
    useShoppingList(hogar?.id ?? null, miPerfilId)

  useEffect(() => {
    if (filteredAssignee) {
      router.push(`?resident=${filteredAssignee}`, { scroll: false })
    } else {
      router.push('/', { scroll: false })
    }
  }, [filteredAssignee, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <p className="font-handwritten text-2xl text-amber-700">Cargando tablero...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 gap-4">
        <p className="font-handwritten text-2xl text-red-600">{error}</p>
        <button
          onClick={() => logout()}
          className="text-sm text-amber-700 underline"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  const hogarNombre = hogar?.nombre

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 flex-shrink-0 flex-col">
        <HomeSidebar
          habitants={habitants}
          hogarNombre={hogarNombre}
          hogar={hogar}
          esAdmin={esAdmin}
          miPerfilId={miPerfilId}
          onRegenerarCodigo={regenerarCodigo}
          onUpdatePerfil={updatePerfil}
          onUpdateHogarNombre={updateHogarNombre}
        />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        habitants={habitants}
        hogarNombre={hogarNombre}
        hogar={hogar}
        esAdmin={esAdmin}
        miPerfilId={miPerfilId}
        onRegenerarCodigo={regenerarCodigo}
        onUpdatePerfil={updatePerfil}
        onUpdateHogarNombre={updateHogarNombre}
      />

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm">
          {/* Tab switcher */}
          <div className="flex gap-0 px-4 pt-3">
            {([
              { key: 'board',   label: 'Tablero', Icon: LayoutGrid },
              { key: 'ranking', label: 'Ranking',  Icon: Trophy },
              { key: 'lista',   label: 'Lista',    Icon: ShoppingCart },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Avatar filter — board tab only */}
          {activeTab === 'board' && (
            <div className="p-4 pt-3 overflow-x-auto">
              <AvatarFilter
                habitants={habitants}
                selectedFilter={filteredAssignee}
                onFilterChange={setFilteredAssignee}
              />
            </div>
          )}
        </header>

        {activeTab === 'board' && (
          <TaskBoard
            tasks={tasks}
            habitants={habitants}
            filteredAssignee={filteredAssignee}
            onCompleteTask={completeTask}
            onEditTask={editTask}
            miPerfilId={miPerfilId}
            esAdmin={esAdmin}
          />
        )}
        {activeTab === 'ranking' && <MonthlyRanking habitants={habitants} />}
        {activeTab === 'lista' && (
          <ShoppingList
            items={listaItems}
            loading={loadingLista}
            esAdmin={esAdmin}
            habitants={habitants}
            onAddItem={addItem}
            onToggleItem={toggleItem}
            onDeleteItem={deleteItem}
            onClearComprados={clearComprados}
          />
        )}
      </div>

      {activeTab === 'board' && (
        <NewTaskDialog habitants={habitants} onAddTask={addTask} />
      )}
    </div>
  )
}
