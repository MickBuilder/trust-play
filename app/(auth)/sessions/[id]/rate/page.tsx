import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionById } from '@/lib/actions/sessions'
import { getPendingRatings, submitRating } from '@/lib/actions/ratings'
import { PlayerRating } from '@/components/rating/PlayerRating'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  MapPin, 
  Calendar, 
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { PlayType, SessionWithParticipants, User } from '@/lib/types/database'
import Image from 'next/image'

interface RateSessionPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ player?: string }>
}

export default async function RateSessionPage({ params, searchParams }: RateSessionPageProps) {
  const { id: sessionId } = await params
  const { player: selectedPlayerId } = await searchParams
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get session details
  const session = await getSessionById(sessionId) as SessionWithParticipants | null
  
  if (!session) {
    redirect('/sessions')
  }

  // Check if user was a participant
  const isParticipant = session.participants?.some((p) => p.user.id === user.id)
  
  if (!isParticipant) {
    redirect(`/sessions/${sessionId}`)
  }

  // Check if session is completed
  if (session.status !== 'completed') {
    redirect(`/sessions/${sessionId}`)
  }

  // Get pending ratings for this user
  const pendingRatings = await getPendingRatings(user.id)
  const sessionPendingRatings = pendingRatings.find((pr) => pr.session.id === sessionId)
  
  if (!sessionPendingRatings || sessionPendingRatings.unratedParticipants.length === 0) {
    // No pending ratings for this session
    redirect(`/sessions/${sessionId}`)
  }

  // Get the selected player or default to first unrated participant
  const selectedPlayer = selectedPlayerId 
    ? sessionPendingRatings.unratedParticipants.find((p: User) => p.id === selectedPlayerId)
    : sessionPendingRatings.unratedParticipants[0]

  if (!selectedPlayer) {
    redirect(`/sessions/${sessionId}`)
  }

  // Handle rating submission
  async function handleRatingSubmit(rating: {
    overall_score: number
    play_type: PlayType
    comment?: string
    is_anonymous: boolean
  }) {
    'use server'
    
    try {
      await submitRating({
        sessionId: sessionId,
        ratedUserId: selectedPlayer.id,
        overallScore: rating.overall_score,
        playType: rating.play_type,
        comment: rating.comment,
        isAnonymous: rating.is_anonymous
      })

      // Check if there are more players to rate
      const remainingPlayers = sessionPendingRatings!.unratedParticipants.filter(
        (p: User) => p.id !== selectedPlayer.id
      )

      if (remainingPlayers.length > 0) {
        // Redirect to rate the next player
        redirect(`/sessions/${sessionId}/rate?player=${remainingPlayers[0].id}`)
      } else {
        // All players rated, redirect to session page
        redirect(`/sessions/${sessionId}`)
      }
    } catch (error) {
      throw error
    }
  }

  const remainingCount = sessionPendingRatings.unratedParticipants.length
  const currentIndex = sessionPendingRatings.unratedParticipants.findIndex((p: User) => p.id === selectedPlayer.id) + 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-300">
              <Link href={`/sessions/${sessionId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Session
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Rate Players</h1>
              <p className="text-gray-400">
                Player {currentIndex} of {remainingCount} remaining
              </p>
            </div>
          </div>

          {/* Session Info Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{session.title}</span>
                <Badge variant="secondary">Completed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(session.date_time), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {session.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {session.location}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  {session.current_participants} participants
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Rating Progress</span>
                <span className="text-sm text-white">
                  {currentIndex}/{remainingCount}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentIndex / remainingCount) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rating Interface */}
          <PlayerRating
            player={selectedPlayer}
            onSubmit={handleRatingSubmit}
            onCancel={() => redirect(`/sessions/${sessionId}`)}
          />

          {/* Other Players to Rate */}
          {sessionPendingRatings.unratedParticipants.length > 1 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Other Players to Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {sessionPendingRatings.unratedParticipants
                    .filter((p: User) => p.id !== selectedPlayer.id)
                    .map((player: User) => (
                      <Link
                        key={player.id}
                        href={`/sessions/${sessionId}/rate?player=${player.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {player.profile_image_url ? (
                          <Image
                            width={32}
                            height={32}
                            src={player.profile_image_url}
                            alt={player.display_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {player.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-white">{player.display_name}</span>
                        <div className="ml-auto">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 