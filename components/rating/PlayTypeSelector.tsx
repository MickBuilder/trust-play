'use client'

import { useState } from 'react'
import { PlayType } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Smile, 
  Trophy, 
  Heart, 
  Zap, 
  Users, 
  Clock,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayTypeOption {
  type: PlayType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const playTypeOptions: PlayTypeOption[] = [
  {
    type: 'fun',
    label: 'Fun Player',
    description: 'Brings joy and positive energy to the game',
    icon: Smile,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20'
  },
  {
    type: 'competitive',
    label: 'Competitive',
    description: 'Plays with intensity and drive to win',
    icon: Trophy,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    type: 'fair_play',
    label: 'Fair Play',
    description: 'Demonstrates excellent sportsmanship',
    icon: Heart,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20'
  },
  {
    type: 'technical',
    label: 'Technical',
    description: 'Shows great skill and technique',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    type: 'social',
    label: 'Social',
    description: 'Great team player and communicator',
    icon: Users,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20'
  },
  {
    type: 'reliable',
    label: 'Reliable',
    description: 'Consistent and dependable player',
    icon: Clock,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  }
]

interface PlayTypeSelectorProps {
  selected?: PlayType
  onSelect: (playType: PlayType) => void
  className?: string
}

export function PlayTypeSelector({ selected, onSelect, className }: PlayTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          What type of player were they today?
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Select the play style that best describes their performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {playTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selected === option.type
          
          return (
            <Card
              key={option.type}
              className={cn(
                'glass-card cursor-pointer transition-all duration-200 hover:scale-[1.02]',
                option.bgColor,
                isSelected && 'ring-2 ring-white/30 scale-[1.02]'
              )}
              onClick={() => onSelect(option.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-white/20' : 'bg-white/10'
                  )}>
                    <Icon className={cn('w-5 h-5', option.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white text-sm">
                        {option.label}
                      </h4>
                      {isSelected && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {selected && (
        <div className="text-center">
          <Badge variant="secondary" className="bg-white/10 text-white">
            Selected: {playTypeOptions.find(opt => opt.type === selected)?.label}
          </Badge>
        </div>
      )}
    </div>
  )
} 