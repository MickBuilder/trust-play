'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateSession } from '@/lib/actions/sessions'
import { SessionWithParticipants } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, Settings, Save, ArrowLeft, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

// Validation schema for session editing
const editSessionSchema = z.object({
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

type EditSessionFormData = z.infer<typeof editSessionSchema>

interface EditSessionFormProps {
  session: SessionWithParticipants
}

export function EditSessionForm({ session }: EditSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Parse existing session data for form defaults
  const sessionDate = new Date(session.date_time)
  
  const form = useForm<EditSessionFormData>({
    resolver: zodResolver(editSessionSchema),
    defaultValues: {
      title: session.title,
      description: session.description || '',
      location: session.location,
      date: format(sessionDate, 'yyyy-MM-dd'),
      time: format(sessionDate, 'HH:mm'),
      duration: session.duration,
      max_participants: session.max_participants
    }
  })

  const handleSubmit = async (data: EditSessionFormData) => {
    startTransition(async () => {
      try {
        // Combine date and time into ISO string
        const dateTime = new Date(`${data.date}T${data.time}:00`)
        
        // Check if max_participants is being reduced below current participant count
        if (data.max_participants < session.current_participants) {
          toast.error(`Cannot reduce max participants below current count (${session.current_participants})`)
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

        await updateSession(session.id, formData)
        
        toast.success('Session updated successfully!')
        router.push(`/sessions/${session.id}`)
        router.refresh()
      } catch (error) {
        console.error('Error updating session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to update session')
      }
    })
  }

  const hasParticipants = session.current_participants > 0
  const isCompleted = session.status === 'completed'
  const isCancelled = session.status === 'cancelled'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/sessions/${session.id}`)}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Session
        </Button>
      </div>

      {/* Warning for completed/cancelled sessions */}
      {(isCompleted || isCancelled) && (
        <Card className="glass-card border-orange-600/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-orange-400 font-medium">
                  {isCompleted ? 'Completed Session' : 'Cancelled Session'}
                </p>
                <p className="text-orange-300 text-sm">
                  {isCompleted ? 
                    'This session has been completed. Changes may not affect past events.' :
                    'This session has been cancelled. Consider creating a new session instead.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Edit Session</CardTitle>
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
                          className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
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
                          className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration (minutes)
                    </FormLabel>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700/50 text-white">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="150">2.5 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Participants */}
              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Maximum Participants
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={Math.max(2, session.current_participants)}
                        max={50}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    {hasParticipants && (
                      <FormDescription className="text-gray-400">
                        Current participants: {session.current_participants}. Cannot be reduced below this number.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/sessions/${session.id}`)}
                  className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Session
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 