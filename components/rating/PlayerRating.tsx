'use client'

import { useState } from 'react'
import { PlayType } from '@/lib/types/database'
import { RatingSlider } from './RatingSlider'
import { PlayTypeSelector } from './PlayTypeSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Star, MessageSquare, EyeOff, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PlayerRatingProps {
  player: {
    id: string
    display_name: string
    profile_image_url?: string
  }
  sessionId: string
  onSubmit: (rating: {
    overall_score: number
    play_type: PlayType
    comment?: string
    is_anonymous: boolean
  }) => Promise<void>
  onCancel?: () => void
  className?: string
}

interface RatingFormData {
  overall_score: number
  play_type?: PlayType
  comment: string
  is_anonymous: boolean
}

export function PlayerRating({ 
  player, 
  sessionId, 
  onSubmit, 
  onCancel, 
  className 
}: PlayerRatingProps) {
  const [formData, setFormData] = useState<RatingFormData>({
    overall_score: 5,
    play_type: undefined,
    comment: '',
    is_anonymous: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.play_type) {
      newErrors.play_type = 'Please select a play type'
    }

    if (formData.overall_score < 1 || formData.overall_score > 10) {
      newErrors.overall_score = 'Rating must be between 1 and 10'
    }

    if (formData.comment.length > 500) {
      newErrors.comment = 'Comment must be 500 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        overall_score: formData.overall_score,
        play_type: formData.play_type!,
        comment: formData.comment.trim() || undefined,
        is_anonymous: formData.is_anonymous
      })
      
      toast.success('Rating submitted successfully!')
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, overall_score: rating }))
    if (errors.overall_score) {
      setErrors(prev => ({ ...prev, overall_score: '' }))
    }
  }

  const handlePlayTypeChange = (playType: PlayType) => {
    setFormData(prev => ({ ...prev, play_type: playType }))
    if (errors.play_type) {
      setErrors(prev => ({ ...prev, play_type: '' }))
    }
  }

  const handleCommentChange = (comment: string) => {
    setFormData(prev => ({ ...prev, comment }))
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: '' }))
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Player Header */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="relative">
              {player.profile_image_url ? (
                <img
                  src={player.profile_image_url}
                  alt={player.display_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-yellow-900" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Rate {player.display_name}</h2>
              <p className="text-sm text-gray-400 font-normal">
                How did they perform in this session?
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Rating Slider */}
      <RatingSlider
        value={formData.overall_score}
        onChange={handleRatingChange}
        disabled={isSubmitting}
      />
      {errors.overall_score && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.overall_score}</AlertDescription>
        </Alert>
      )}

      {/* Play Type Selection */}
      <PlayTypeSelector
        selected={formData.play_type}
        onSelect={handlePlayTypeChange}
        className={errors.play_type ? 'ring-2 ring-red-500/50' : ''}
      />
      {errors.play_type && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.play_type}</AlertDescription>
        </Alert>
      )}

      {/* Optional Comment */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <Label htmlFor="comment" className="text-white font-medium">
              Additional Comments (Optional)
            </Label>
          </div>
          <Textarea
            id="comment"
            placeholder="Share specific feedback about their performance..."
            value={formData.comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[100px] bg-white/5 border-gray-600 text-white placeholder:text-gray-500"
            maxLength={500}
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Help them improve with constructive feedback</span>
            <span>{formData.comment.length}/500</span>
          </div>
          {errors.comment && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.comment}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Anonymous Option */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="anonymous"
              checked={formData.is_anonymous}
              onCheckedChange={(checked: boolean) => 
                setFormData(prev => ({ ...prev, is_anonymous: checked }))
              }
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-gray-400" />
              <Label htmlFor="anonymous" className="text-white text-sm">
                Submit this rating anonymously
              </Label>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-6">
            Your identity will be hidden from the player being rated
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.play_type}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Rating
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
            className="border-gray-600 text-gray-300 hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Form Summary */}
      {formData.play_type && (
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">Rating Summary</p>
              <div className="flex items-center justify-center gap-4 text-white">
                <span className="font-bold text-lg">
                  {formData.overall_score.toFixed(1)}/10
                </span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">
                  {formData.play_type.replace('_', ' ')}
                </span>
                {formData.is_anonymous && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">Anonymous</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 