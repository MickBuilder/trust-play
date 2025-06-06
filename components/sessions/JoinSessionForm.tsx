'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus,
  CheckCircle,
  AlertCircle,
  UserMinus
} from 'lucide-react'
import { joinSession, leaveSession } from '@/lib/actions/sessions'
import { toast } from 'sonner'
import { Session, User } from '@/lib/types/database'

interface JoinSessionFormProps {
  session: Session
  user: User
  isParticipant: boolean
  isOrganizer: boolean
  isSessionFull: boolean
  isSessionPast: boolean
}

export function JoinSessionForm({
  session,
  user,
  isParticipant,
  isOrganizer,
  isSessionFull,
  isSessionPast
}: JoinSessionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionType, setActionType] = useState<'join' | 'leave' | null>(null)

  const handleJoinSession = () => {
    if (isSessionFull) {
      toast.error('This session is full')
      return
    }

    if (isSessionPast) {
      toast.error('Cannot join a session that has already started')
      return
    }

    setActionType('join')
    startTransition(async () => {
      try {
        await joinSession(session.id)
        toast.success('Successfully joined the session!')
        router.push(`/sessions/${session.id}`)
      } catch (error) {
        console.error('Error joining session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to join session')
      } finally {
        setActionType(null)
      }
    })
  }

  const handleLeaveSession = () => {
    setActionType('leave')
    startTransition(async () => {
      try {
        await leaveSession(session.id)
        toast.success('Successfully left the session')
        router.push('/sessions')
      } catch (error) {
        console.error('Error leaving session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to leave session')
      } finally {
        setActionType(null)
      }
    })
  }

  // Status Messages
  if (session.status === 'cancelled') {
    return (
      <Alert className="border-red-600/50 bg-red-600/10">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-400">
          This session has been cancelled by the organizer.
        </AlertDescription>
      </Alert>
    )
  }

  if (isSessionPast) {
    return (
      <Alert className="border-orange-600/50 bg-orange-600/10">
        <AlertCircle className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-orange-400">
          This session has already started and new participants cannot join.
        </AlertDescription>
      </Alert>
    )
  }

  if (isOrganizer) {
    return (
      <Alert className="border-blue-600/50 bg-blue-600/10">
        <CheckCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-400">
          You are the organizer of this session.
        </AlertDescription>
      </Alert>
    )
  }

  if (isParticipant) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-600/50 bg-green-600/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            You have already joined this session!
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => router.push(`/sessions/${session.id}`)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            View Session
          </Button>
          
          <Button 
            onClick={handleLeaveSession}
            disabled={isPending}
            variant="outline"
            className="border-red-600/50 text-red-400 hover:bg-red-600/10"
          >
            {isPending && actionType === 'leave' ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin mr-2" />
                Leaving...
              </>
            ) : (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Leave Session
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Not a participant - show join option
  return (
    <div className="space-y-4">
      {isSessionFull && (
        <Alert className="border-yellow-600/50 bg-yellow-600/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">
            This session is full. You'll be added to a waiting list.
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleJoinSession}
        disabled={isPending}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
      >
        {isPending && actionType === 'join' ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Joining...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            {isSessionFull ? 'Join Waiting List' : 'Join Session'}
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        You'll be redirected to the session page after joining
      </p>
    </div>
  )
} 