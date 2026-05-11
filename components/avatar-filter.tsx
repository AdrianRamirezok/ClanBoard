'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Habitant } from '@/lib/types'

interface AvatarFilterProps {
  habitants: Habitant[]
  selectedFilter: string | null
  onFilterChange: (id: string | null) => void
}

export function AvatarFilter({ habitants, selectedFilter, onFilterChange }: AvatarFilterProps) {
  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border min-w-0">
      <span className="text-sm font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Filtrar por:</span>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pr-4 flex-1 scrollbar-hide">
        {/* All tasks button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
            selectedFilter === null
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Todos
        </motion.button>

        {/* Avatar filters */}
        {habitants.map((habitant) => (
          <motion.button
            key={habitant.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onFilterChange(selectedFilter === habitant.id ? null : habitant.id)}
            className={cn(
              'relative rounded-full transition-all duration-200 flex-shrink-0',
              selectedFilter === habitant.id 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                : 'opacity-70 hover:opacity-100'
            )}
            title={habitant.name}
          >
            <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
              <AvatarImage src={habitant.avatar} alt={habitant.name} />
              <AvatarFallback>{habitant.name[0]}</AvatarFallback>
            </Avatar>
            
            {selectedFilter === habitant.id && (
              <motion.div
                layoutId="avatar-indicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
