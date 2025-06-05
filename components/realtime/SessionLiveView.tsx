'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, MapPin, Trophy } from 'lucide-react'
import { useSessionRealtime } from '@/lib/hooks/useRealtime'
import { getSessionWithDetails } from '@/lib/database/sessions'
import { SessionWithDetails } from '@/lib/types/database'

interface SessionLiveViewProps {
  sessionId: string
  initialSession?: SessionWithDetails
}

export function SessionLiveView({ sessionId, initialSession }: SessionLiveViewProps) {
  const [sessionData, setSessionData] = useState<SessionWithDetails | null>(initialSession || null)
  const [loading, setLoading] = useState(!initialSession)
  
  // Real-time updates for session and participants
  const { session: liveSession, participants: liveParticipants } = useSessionRealtime(sessionId)

  // Initial data fetch if not provided
  useEffect(() => {
    if (!sessionData) {
      const fetchSession = async () => {
        try {
          const session = await getSessionWithDetails(sessionId)
          setSessionData(session)
        } catch (error) {
          console.error('Error fetching session:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchSession()
    }
  }, [sessionId, sessionData])

  // Update session data when real-time updates come in
  useEffect(() => {
    if (liveSession) {
      setSessionData(prev => prev ? { ...prev, ...liveSession } : null)
    }
  }, [liveSession])

  // Update participants when real-time updates come in
  useEffect(() => {
    if (liveParticipants.length > 0 && sessionData) {
      setSessionData(prev => prev ? {
        ...prev,
        participants: liveParticipants,
        participant_count: liveParticipants.length
      } : null)
    }
  }, [liveParticipants, sessionData])

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sessionData) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Session not found</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <Card className="w-full max-w-2xl glass-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white">{sessionData.title}</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {sessionData.description || 'Football session'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(sessionData.status)}>
            {sessionData.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm">
              {new Date(sessionData.date_time).toLocaleDateString()} at{' '}
              {new Date(sessionData.date_time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-sm">{sessionData.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm">
              {sessionData.participant_count || 0} / {sessionData.max_participants} players
            </span>
          </div>
        </div>

        {/* MVP Display */}
        {sessionData.mvp_user && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-400">Session MVP</h4>
                <p className="text-white">{sessionData.mvp_user.display_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Participants */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            Participants
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </h4>
          
          {sessionData.participants && sessionData.participants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sessionData.participants.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {participant.display_name?.[0] || participant.username?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {participant.display_name || participant.username}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Rating: {participant.current_overall_rating?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  {participant.id === sessionData.organizer?.id && (
                    <Badge variant="outline" className="text-xs">
                      Organizer
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No participants yet</p>
          )}
        </div>

        {/* Action Buttons */}
        {sessionData.status === 'upcoming' && (
          <div className="flex gap-2">
            <Button variant="default" className="flex-1">
              Join Session
            </Button>
            <Button variant="outline">
              Share QR Code
            </Button>
          </div>
        )}

        {sessionData.status === 'active' && (
          <div className="flex gap-2">
            <Button variant="default" className="flex-1">
              Rate Players
            </Button>
            <Button variant="outline">
              End Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 