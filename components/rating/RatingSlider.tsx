'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
}

const getRatingLabel = (rating: number): string => {
  if (rating >= 9) return 'Outstanding'
  if (rating >= 8) return 'Excellent'
  if (rating >= 7) return 'Very Good'
  if (rating >= 6) return 'Good'
  if (rating >= 5) return 'Average'
  if (rating >= 4) return 'Below Average'
  if (rating >= 3) return 'Poor'
  if (rating >= 2) return 'Very Poor'
  return 'Needs Improvement'
}

const getRatingColor = (rating: number): string => {
  if (rating >= 8) return 'text-green-400'
  if (rating >= 6) return 'text-yellow-400'
  if (rating >= 4) return 'text-orange-400'
  return 'text-red-400'
}

const getRatingIcon = (rating: number) => {
  if (rating >= 7) return TrendingUp
  if (rating >= 4) return Minus
  return TrendingDown
}

export function RatingSlider({ value, onChange, className, disabled = false }: RatingSliderProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    const rating = newValue[0]
    setDisplayValue(rating)
    setIsAnimating(true)
    onChange(rating)
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 200)
  }

  const RatingIcon = getRatingIcon(displayValue)
  const ratingColor = getRatingColor(displayValue)
  const ratingLabel = getRatingLabel(displayValue)

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Overall Performance Rating
        </h3>
        <p className="text-sm text-gray-400">
          Rate their overall performance from 1 (poor) to 10 (outstanding)
        </p>
      </div>

      {/* Rating Display */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Large Rating Number */}
            <div className={cn(
              'transition-all duration-200',
              isAnimating && 'scale-110'
            )}>
              <div className={cn(
                'text-6xl font-bold transition-colors duration-200',
                ratingColor
              )}>
                {displayValue.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <RatingIcon className={cn('w-5 h-5', ratingColor)} />
                <span className={cn('text-lg font-medium', ratingColor)}>
                  {ratingLabel}
                </span>
              </div>
            </div>

            {/* Star Rating Visual */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: 10 }, (_, i) => {
                const starValue = i + 1
                const isFilled = starValue <= Math.floor(displayValue)
                const isHalfFilled = starValue === Math.ceil(displayValue) && displayValue % 1 !== 0
                
                return (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4 transition-colors duration-200',
                      isFilled || isHalfFilled
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    )}
                  />
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slider */}
      <div className="space-y-4">
        <Slider
          value={[displayValue]}
          onValueChange={handleValueChange}
          min={1}
          max={10}
          step={0.5}
          disabled={disabled}
          className="w-full"
        />
        
        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
        
        {/* Quick Rating Buttons */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[2, 4, 6, 8, 10].map((quickRating) => (
            <button
              key={quickRating}
              onClick={() => handleValueChange([quickRating])}
              disabled={disabled}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'border border-gray-600 hover:border-gray-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                displayValue === quickRating
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {quickRating}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Guidelines:</strong></p>
        <p>• 8-10: Exceptional performance, standout player</p>
        <p>• 6-7: Good solid performance, contributed well</p>
        <p>• 4-5: Average performance, did their part</p>
        <p>• 1-3: Below expectations, room for improvement</p>
      </div>
    </div>
  )
} 