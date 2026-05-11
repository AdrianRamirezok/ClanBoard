'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { HomeSidebar } from './home-sidebar'
import { MobileHeader } from './mobile-header'
import { AvatarFilter } from './avatar-filter'
import { TaskBoard } from './task-board'
import { NewTaskDialog } from './new-task-dialog'
import { initialHabitants, initialTasks } from '@/lib/data'
import type { Task, Habitant } from '@/lib/types'
import { difficultyXP } from '@/lib/types'

export function HomeBoard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [habitants, setHabitants] = useState<Habitant[]>(initialHabitants)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  
  // Get filter from URL, fallback to null
  const filteredAssigneeFromUrl = searchParams.get('resident') || null
  const [filteredAssignee, setFilteredAssignee] = useState<string | null>(filteredAssigneeFromUrl)

  // Sync URL when filter changes
  useEffect(() => {
    if (filteredAssignee) {
      router.push(`?resident=${filteredAssignee}`, { scroll: false })
    } else {
      router.push('/', { scroll: false })
    }
  }, [filteredAssignee, router])

  const handleCompleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        // Award XP based on difficulty
        const xpReward = difficultyXP[task.difficulty]
        setHabitants(habitants => habitants.map(h => 
          h.id === task.assigneeId 
            ? { ...h, xp: h.xp + xpReward } 
            : h
        ))
        return { ...task, completed: true }
      }
      return task
    }))
  }, [])

  const handleAddTask = useCallback((newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setTasks(prev => [task, ...prev])
  }, [])

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-72 flex-col">
        <HomeSidebar habitants={habitants} />
      </div>

      {/* Mobile Header - shown only on mobile */}
      <MobileHeader habitants={habitants} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <header className="p-4 border-b border-border bg-background/80 backdrop-blur-sm overflow-x-auto">
          <AvatarFilter
            habitants={habitants}
            selectedFilter={filteredAssignee}
            onFilterChange={setFilteredAssignee}
          />
        </header>

        {/* Task board */}
        <TaskBoard
          tasks={tasks}
          habitants={habitants}
          filteredAssignee={filteredAssignee}
          onCompleteTask={handleCompleteTask}
        />
      </div>

      {/* Floating action button */}
      <NewTaskDialog habitants={habitants} onAddTask={handleAddTask} />
    </div>
  )
}
