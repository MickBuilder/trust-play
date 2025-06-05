'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createSession } from '@/lib/actions/sessions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, Trophy, Save, X } from 'lucide-react'
import { format, addMinutes, startOfTomorrow } from 'date-fns'

// Validation schema for session creation
const createSessionSchema = z.object({
  title: z.string()
    .min(3, 'Session title must be at least 3 characters')
    .max(100, 'Session title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters'),
  date: z.string()
    .min(1, 'Date is required'),
  time: z.string()
    .min(1, 'Time is required'),
  duration: z.number()
    .min(30, 'Duration must be at least 30 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  max_participants: z.number()
    .min(2, 'At least 2 participants required')
    .max(50, 'Maximum 50 participants allowed')
})

type CreateSessionFormData = z.infer<typeof createSessionSchema>

interface CreateSessionFormProps {
  onCancel?: () => void
  onSuccess?: (sessionId: string) => void
}

export function CreateSessionForm({ onCancel, onSuccess }: CreateSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      date: format(startOfTomorrow(), 'yyyy-MM-dd'),
      time: '18:00',
      duration: 120, // 2 hours default
      max_participants: 20
    }
  })

  const handleSubmit = async (data: CreateSessionFormData) => {
    startTransition(async () => {
      try {
        // Combine date and time into ISO string
        const dateTime = new Date(`${data.date}T${data.time}:00`)
        
        // Validate that the date/time is in the future
        if (dateTime <= new Date()) {
          toast.error('Session date and time must be in the future')
          return
        }

        // Create FormData for server action
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('description', data.description || '')
        formData.append('location', data.location)
        formData.append('date_time', dateTime.toISOString())
        formData.append('duration', data.duration.toString())
        formData.append('max_participants', data.max_participants.toString())

        const result = await createSession(formData)
        
        if (result.success) {
          toast.success('Session created successfully!')
          
          if (onSuccess) {
            onSuccess(result.session.id)
          } else {
            // Navigate to the new session
            router.push(`/sessions/${result.session.id}`)
          }
        }
      } catch (error) {
        console.error('Error creating session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create session')
      }
    })
  }

  return (
    <Card className="glass-card w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Create New Session</CardTitle>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Session Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Session Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Sunday Evening Football"
                      className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Casual football match for all skill levels. Bring your own water!"
                      rows={3}
                      className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Add any additional details about the session
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Central Park Football Field"
                      className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="bg-gray-900/50 border-gray-700/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        className="bg-gray-900/50 border-gray-700/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration and Max Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Duration (minutes)</FormLabel>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={(value: string) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="60" className="text-white hover:bg-gray-800">1 hour</SelectItem>
                        <SelectItem value="90" className="text-white hover:bg-gray-800">1.5 hours</SelectItem>
                        <SelectItem value="120" className="text-white hover:bg-gray-800">2 hours</SelectItem>
                        <SelectItem value="150" className="text-white hover:bg-gray-800">2.5 hours</SelectItem>
                        <SelectItem value="180" className="text-white hover:bg-gray-800">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Max Participants
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="2"
                        max="50"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-gray-900/50 border-gray-700/50 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isPending}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/25"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isPending}
                  className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 