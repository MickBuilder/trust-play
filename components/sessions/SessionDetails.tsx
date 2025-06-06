'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SessionWithParticipants } from '@/lib/types/database'
import { joinSession, leaveSession, closeSession, removeParticipant, cancelSession } from '@/lib/actions/sessions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SessionQRCode } from './SessionQRCode'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  ArrowLeft,
  UserPlus,
  UserMinus,
  Crown,
  Share2,
  QrCode,
  AlertCircle,
  CheckCircle,
  Timer,
  Settings,
  UserX,
  Edit3,
  X,
  Shield,
  Ban
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture, addMinutes } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/hooks/useUser'

interface SessionDetailsProps {
  session: SessionWithParticipants
}

export function SessionDetails({ session }: SessionDetailsProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isPending, startTransition] = useTransition()
  const [actionType, setActionType] = useState<'join' | 'leave' | 'close' | 'cancel' | 'remove' | null>(null)
  const [showParticipantManagement, setShowParticipantManagement] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null)

  const sessionDate = new Date(session.date_time)
  const endTime = addMinutes(sessionDate, session.duration)
  const isSessionPast = isPast(sessionDate)
  const isSessionActive = isPast(sessionDate) && isFuture(endTime)
  const isSessionFull = session.current_participants >= session.max_participants
  
  // Check if current user is organizer
  const isOrganizer = user?.id === session.organizer_id
  
  // Check if current user is already a participant
  const isParticipant = session.participants?.some(p => p.user.id === user?.id) || false
  
  // Calculate participant percentage
  const participantPercentage =
    session.max_participants > 0
      ? (session.current_participants / session.max_participants) * 100
      : 0

  const getSessionStatus = () => {
    if (session.status === 'cancelled') return { label: 'Cancelled', color: 'destructive' }
    if (session.status === 'completed') return { label: 'Completed', color: 'secondary' }
    if (isSessionActive) return { label: 'Active', color: 'default' }
    if (isSessionPast)   return { label: 'Ended',  color: 'secondary' }
    if (isSessionFull) return { label: 'Full', color: 'secondary' }
    return { label: 'Open', color: 'default' }
  }

  const handleJoinSession = () => {
    if (!user) {
      toast.error('Please sign in to join this session')
      return
    }

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
        router.refresh()
      } catch (error) {
        console.error('Error joining session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to join session')
      } finally {
        setActionType(null)
      }
    })
  }

  const handleLeaveSession = () => {
    if (!user) return

    setActionType('leave')
    startTransition(async () => {
      try {
        await leaveSession(session.id)
        toast.success('Successfully left the session')
        router.refresh()
      } catch (error) {
        console.error('Error leaving session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to leave session')
      } finally {
        setActionType(null)
      }
    })
  }

  const handleCloseSession = () => {
    if (!isOrganizer) return

    setActionType('close')
    startTransition(async () => {
      try {
        await closeSession(session.id)
        toast.success('Session has been completed')
        router.refresh()
      } catch (error) {
        console.error('Error closing session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to close session')
      } finally {
        setActionType(null)
      }
    })
  }

  const handleRemoveParticipant = (participantId: string, participantName: string) => {
    if (!isOrganizer) return

    setParticipantToRemove(participantId)
    setActionType('remove')
    startTransition(async () => {
      try {
        await removeParticipant(session.id, participantId)
        toast.success(`${participantName} has been removed from the session`)
        router.refresh()
      } catch (error) {
        console.error('Error removing participant:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to remove participant')
      } finally {
        setActionType(null)
        setParticipantToRemove(null)
      }
    })
  }

  const handleCancelSession = () => {
    if (!isOrganizer) return

    setActionType('cancel')
    startTransition(async () => {
      try {
        await cancelSession(session.id)
        toast.success('Session has been cancelled')
        router.refresh()
      } catch (error) {
        console.error('Error cancelling session:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to cancel session')
      } finally {
        setActionType(null)
      }
    })
  }

  const handleShare = async () => {
    const shareData = {
      title: session.title,
      text: `Join this football session: ${session.title}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Session link copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Session link copied to clipboard!')
    }
  }

  const sessionStatus = getSessionStatus()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white self-start p-2 sm:px-4 sm:py-2"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Back to Sessions</span>
        </Button>
        
        {/* Action Buttons - Mobile Stack */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="flex-1 sm:flex-none border-gray-700/50 text-gray-300 hover:bg-gray-800/50 h-10 sm:h-8 text-sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {session.qr_code_data && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowQRCode(!showQRCode)}
                className="flex-1 sm:flex-none border-gray-700/50 text-gray-300 hover:bg-gray-800/50 h-10 sm:h-8 text-sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            )}
          </div>
          {isOrganizer && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowParticipantManagement(!showParticipantManagement)}
              className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 h-10 sm:h-8 text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Session Title and Status - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">{session.title}</h1>
            <p className="text-sm sm:text-base text-gray-400">
              Organized by {session.organizer?.display_name || 'Unknown Organizer'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={sessionStatus.color as any} 
              className="text-xs sm:text-sm px-2 py-1"
            >
              {sessionStatus.label}
            </Badge>
            {isOrganizer && (
              <Badge variant="outline" className="text-xs sm:text-sm border-yellow-600 text-yellow-400 px-2 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Organizer
              </Badge>
            )}
            {isParticipant && !isOrganizer && (
              <Badge variant="outline" className="text-xs sm:text-sm border-green-600 text-green-400 px-2 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Joined
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Organizer Management Panel */}
      {isOrganizer && showParticipantManagement && (
        <Card className="glass-card border-yellow-600/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Session Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button 
                onClick={() => router.push(`/sessions/${session.id}/edit`)}
                variant="outline"
                className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Session
              </Button>
              
              {session.status !== 'completed' && session.status !== 'cancelled' && (
                <>
                  <Button 
                    onClick={handleCloseSession}
                    disabled={isPending && actionType === 'close'}
                    variant="outline"
                    className="border-green-600/50 text-green-400 hover:bg-green-600/10"
                  >
                    {isPending && actionType === 'close' ? (
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Complete Session
                  </Button>
                  
                  <Button 
                    onClick={handleCancelSession}
                    disabled={isPending && actionType === 'cancel'}
                    variant="outline"
                    className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                  >
                    {isPending && actionType === 'cancel' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Cancel Session
                      </>
                    )}
                  </Button>
                </>
              )}

              <Button 
                onClick={() => setShowParticipantManagement(false)}
                variant="outline"
                className="border-gray-600/50 text-gray-400 hover:bg-gray-600/10"
              >
                <X className="w-4 h-4 mr-2" />
                Close Panel
              </Button>
            </div>

            {session.participants && session.participants.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participant Management
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {session.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={(participant.user as any).avatar_url || undefined} />
                          <AvatarFallback className="bg-gray-700 text-gray-300">
                            {participant.user.display_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {participant.user.display_name || 'Unknown Player'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined {formatDistanceToNow(new Date((participant as any).created_at || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {participant.user.id === session.organizer_id ? (
                          <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                            <Crown className="w-3 h-3 mr-1" />
                            Organizer
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleRemoveParticipant(participant.user.id, participant.user.display_name || 'participant')}
                            disabled={isPending && participantToRemove === participant.user.id}
                            variant="outline"
                            size="sm"
                            className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                          >
                            {isPending && participantToRemove === participant.user.id ? (
                              <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <UserX className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.description && (
                <div>
                  <h4 className="text-white font-medium mb-2">Description</h4>
                  <p className="text-gray-300">{session.description}</p>
                </div>
              )}
              
              <Separator className="bg-gray-700/50" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-medium">{session.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-medium">{format(sessionDate, 'EEEE, MMMM dd, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Clock className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-medium">{format(sessionDate, 'HH:mm')} - {format(endTime, 'HH:mm')}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Timer className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-medium">{session.duration} minutes</p>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-gray-700/50" />
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Session starts in:</span>
                <span className="text-white font-medium">
                  {formatDistanceToNow(sessionDate, { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({session.current_participants}/{session.max_participants})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.participants && session.participants.length > 0 ? (
                <div className="space-y-3">
                  {session.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={(participant.user as any).avatar_url || undefined} />
                          <AvatarFallback className="bg-gray-700 text-gray-300">
                            {participant.user.display_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">
                            {participant.user.display_name || 'Unknown Player'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined {formatDistanceToNow(new Date((participant as any).created_at || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.user.id === session.organizer_id && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        {session.mvp_user_id === participant.user.id && (
                          <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                            <Trophy className="w-3 h-3 mr-1" />
                            MVP
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No participants yet</p>
                  <p className="text-sm text-gray-500">Be the first to join!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Join/Leave Action */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Participant Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Capacity</span>
                    <span className={cn(
                      "text-sm font-medium",
                      participantPercentage >= 90 ? "text-red-400" : 
                      participantPercentage >= 70 ? "text-yellow-400" : "text-green-400"
                    )}>
                      {session.current_participants}/{session.max_participants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        participantPercentage >= 90 ? "bg-red-500" :
                        participantPercentage >= 70 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(participantPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {user ? (
                  <div className="space-y-3">
                    {!isOrganizer && (
                      <>
                        {!isParticipant ? (
                          <Button 
                            onClick={handleJoinSession}
                            disabled={isPending || isSessionFull || isSessionPast || session.status === 'cancelled'}
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
                                {isSessionFull ? 'Session Full' : 'Join Session'}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleLeaveSession}
                            disabled={isPending}
                            variant="outline"
                            className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10"
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
                        )}
                      </>
                    )}

                    {isOrganizer && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 text-center">
                          You are the organizer of this session
                        </p>
                        <Button 
                          onClick={() => router.push(`/sessions/${session.id}/edit`)}
                          variant="outline"
                          className="w-full border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Session
                        </Button>
                      </div>
                    )}

                    {/* Rating Button for Completed Sessions */}
                    {session.status === 'completed' && isParticipant && (
                      <Button 
                        onClick={() => router.push(`/sessions/${session.id}/rate`)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Rate Players
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-3">Sign in to join this session</p>
                    <Button onClick={() => router.push('/login')} className="w-full">
                      Sign In
                    </Button>
                  </div>
                )}

                {/* Status Messages */}
                {isSessionPast && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      <p className="text-orange-400 text-sm">This session has already started</p>
                    </div>
                  </div>
                )}

                {session.status === 'cancelled' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-red-400 text-sm">This session has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Created</span>
                <span className="text-white text-sm">
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Session ID</span>
                <span className="text-white text-sm font-mono">{session.qr_code_data}</span>
              </div>
              {session.mvp_user_id && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">MVP</span>
                  <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                    <Trophy className="w-3 h-3 mr-1" />
                    Determined
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Display */}
          {showQRCode && session.qr_code_data && (
            <SessionQRCode session={session} />
          )}
        </div>
      </div>
    </div>
  )
} 