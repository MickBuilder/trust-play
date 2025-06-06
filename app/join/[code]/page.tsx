import { redirect } from 'next/navigation'
import { getSessionByQRCode } from '@/lib/database/sessions'
import { joinSession } from '@/lib/actions/sessions'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { format, isPast, isFuture, addMinutes } from 'date-fns'
import Link from 'next/link'
import { JoinSessionForm } from '@/components/sessions/JoinSessionForm'
import { SessionWithParticipants } from '@/lib/types/database'

interface JoinSessionPageProps {
  params: Promise<{ code: string }>
}

export default async function JoinSessionPage({ params }: JoinSessionPageProps) {
  const { code } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Redirect to login with return URL
    redirect(`/login?redirect=/join/${code}`)
  }

  // Get session by code with participants and organizer
  const session = await getSessionByQRCode(code) as SessionWithParticipants | null
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center p-3 sm:p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
        
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="text-center px-4 sm:px-6 pt-6 pb-4">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-lg sm:text-xl">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
              Session Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 px-4 sm:px-6 pb-6">
            <p className="text-gray-400 text-sm sm:text-base">
              The session code "{code}" is not valid or the session may have been cancelled.
            </p>
            <div className="space-y-3 sm:space-y-2">
              <Button asChild className="w-full h-11 sm:h-10 text-sm sm:text-base">
                <Link href="/sessions">Browse Active Sessions</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 h-11 sm:h-10 text-sm sm:text-base">
                <Link href="/scan">Scan QR Code</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sessionDate = new Date(session.date_time)
  const endTime = addMinutes(sessionDate, session.duration)
  const isSessionPast = isPast(sessionDate)
  const isSessionActive = isPast(sessionDate) && isFuture(endTime)
  const isSessionFull = session.current_participants >= session.max_participants
  
  // Check if user is already a participant
  const isParticipant = session.participants?.some((p: any) => p.user.id === user.id) || false
  const isOrganizer = user.id === session.organizer_id

  // Get user profile for proper typing
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const getSessionStatus = () => {
    if (session.status === 'cancelled') return { label: 'Cancelled', color: 'destructive' }
    if (session.status === 'completed') return { label: 'Completed', color: 'secondary' }
    if (isSessionPast) return { label: 'Ended', color: 'secondary' }
    if (isSessionActive) return { label: 'Active', color: 'default' }
    if (isSessionFull) return { label: 'Full', color: 'secondary' }
    return { label: 'Open', color: 'default' }
  }

  const sessionStatus = getSessionStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Header - Mobile Optimized */}
          <div className="text-center space-y-2 px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Join Session</h1>
            <p className="text-gray-400 text-sm sm:text-base">You've been invited to join this football session</p>
          </div>

          {/* Session Details Card - Mobile Optimized */}
          <Card className="glass-card">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <CardTitle className="text-white text-lg sm:text-xl pr-2">{session.title}</CardTitle>
                <Badge variant={sessionStatus.color as any} className="self-start sm:self-center">
                  {sessionStatus.label}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Organized by {session.organizer?.display_name || 'Unknown Organizer'}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Session Info - Mobile Optimized Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Date & Time</p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {format(sessionDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {format(sessionDate, 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Duration</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{session.duration} minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-900/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Location</p>
                    <p className="text-gray-400 text-xs sm:text-sm break-words">{session.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Participants</p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {session.current_participants}/{session.max_participants} joined
                    </p>
                  </div>
                </div>
              </div>

              {/* Description - Mobile Optimized */}
              {session.description && (
                <div className="p-3 bg-gray-900/20 rounded-lg">
                  <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Description</h4>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {session.description}
                  </p>
                </div>
              )}

              {/* Join Form */}
              {userProfile && (
                <JoinSessionForm 
                  session={session}
                  user={userProfile}
                  isParticipant={isParticipant}
                  isOrganizer={isOrganizer}
                  isSessionFull={isSessionFull}
                  isSessionPast={isSessionPast}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation - Mobile Optimized */}
          <div className="text-center space-y-3 px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="border-gray-600 text-gray-300 h-11 sm:h-10 text-sm sm:text-base">
                <Link href="/sessions">Browse All Sessions</Link>
              </Button>
              <Button asChild variant="outline" className="border-gray-600 text-gray-300 h-11 sm:h-10 text-sm sm:text-base">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 