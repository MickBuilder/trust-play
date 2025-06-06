'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRealtime, useSessionRealtime, useRatingsRealtime, useUserStatsRealtime } from '@/lib/hooks/useRealtime'
import { RealtimeNotifications } from '@/lib/context/RealtimeProvider'
import { createClient } from '@/lib/supabase/client'
import { Session, User, Rating } from '@/lib/types/database'
import { 
  Users, 
  Star, 
  Clock, 
  Activity, 
  Wifi, 
  WifiOff,
  Plus,
  Minus,
  Trophy
} from 'lucide-react'

export default function RealtimeDemoPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected')
  const [liveUpdates, setLiveUpdates] = useState<any[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])

  // Demo session for real-time updates
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Real-time hooks for demonstration
  const { isConnected: sessionsConnected } = useRealtime({
    table: 'sessions',
    onChange: (payload) => {
      setLiveUpdates(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'session',
        event: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date().toLocaleTimeString()
      }])
      
      if (payload.eventType === 'INSERT' && payload.new) {
        setSessions(prev => [...prev, payload.new])
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setSessions(prev => prev.filter(s => s.id !== payload.old.id))
      }
    }
  })

  const { isConnected: usersConnected } = useRealtime({
    table: 'users',
    onChange: (payload) => {
      setLiveUpdates(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'user',
        event: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date().toLocaleTimeString()
      }])
      
      if (payload.eventType === 'UPDATE' && payload.new) {
        setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u))
      }
    }
  })

  const { isConnected: ratingsConnected } = useRealtime({
    table: 'ratings',
    onChange: (payload) => {
      setLiveUpdates(prev => [...prev.slice(-4), {
        id: Date.now(),
        type: 'rating',
        event: payload.eventType,
        data: payload.new || payload.old,
        timestamp: new Date().toLocaleTimeString()
      }])
      
      if (payload.eventType === 'INSERT' && payload.new) {
        setRatings(prev => [...prev, payload.new])
      }
    }
  })

  // Selected session real-time data
  const { session: liveSession, participants: liveParticipants } = useSessionRealtime(selectedSessionId || undefined)

  // Demo functions to trigger database changes
  const createDemoSession = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        title: `Demo Session ${Date.now()}`,
        description: 'A real-time demonstration session',
        location: 'Central Park',
        date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        max_participants: 10,
        status: 'upcoming',
        organizer_id: '00000000-0000-0000-0000-000000000000' // Demo organizer
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating demo session:', error)
    } else {
      setSelectedSessionId(data.id)
    }
  }

  const updateDemoSession = async () => {
    if (!selectedSessionId) return
    
    const supabase = createClient()
    await supabase
      .from('sessions')
      .update({
        status: 'active',
        participant_count: Math.floor(Math.random() * 8) + 2
      })
      .eq('id', selectedSessionId)
  }

  useEffect(() => {
    const overallConnected = sessionsConnected && usersConnected && ratingsConnected
    setConnectionStatus(overallConnected ? 'connected' : 'connecting')
  }, [sessionsConnected, usersConnected, ratingsConnected])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Real-time Demo</h1>
          <p className="text-gray-400">Experience TrustPlay's live updates in action</p>
        </div>

        {/* Connection Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Sessions</span>
                <div className={`w-3 h-3 rounded-full ${sessionsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Users</span>
                <div className={`w-3 h-3 rounded-full ${usersConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Ratings</span>
                <div className={`w-3 h-3 rounded-full ${ratingsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Controls */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Demo Controls
            </CardTitle>
            <CardDescription>
              Trigger real-time updates to see the system in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={createDemoSession} variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Create Demo Session
              </Button>
              <Button 
                onClick={updateDemoSession} 
                variant="outline"
                disabled={!selectedSessionId}
              >
                Update Session
              </Button>
            </div>
            {selectedSessionId && (
              <p className="text-sm text-gray-400 mt-2">
                Selected session: {selectedSessionId.slice(0, 8)}...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Live Updates Feed */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400 animate-pulse" />
              Live Updates
            </CardTitle>
            <CardDescription>
              Real-time database changes appear here instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            {liveUpdates.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No updates yet. Create a demo session to see real-time updates!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {liveUpdates.map((update) => (
                  <div 
                    key={update.id}
                    className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={
                        update.type === 'session' ? 'border-blue-500/50 text-blue-400' :
                        update.type === 'user' ? 'border-green-500/50 text-green-400' :
                        'border-purple-500/50 text-purple-400'
                      }>
                        {update.type}
                      </Badge>
                      <span className="text-white text-sm">
                        {update.event} - {update.data?.title || update.data?.display_name || 'Update'}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">{update.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Session Live View */}
        {liveSession && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Live Session View
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription>
                Watch this session update in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{liveSession.title}</h3>
                    <p className="text-gray-400">{liveSession.description}</p>
                  </div>
                  <Badge className={
                    liveSession.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                    liveSession.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }>
                    {liveSession.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{liveSession.participant_count || 0}</p>
                    <p className="text-xs text-gray-400">Participants</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{liveSession.max_participants}</p>
                    <p className="text-xs text-gray-400">Max Players</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{liveSession.mvp_user_id ? '1' : '0'}</p>
                    <p className="text-xs text-gray-400">MVP Set</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Live Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Sessions</span>
                  <span className="text-white font-semibold">{sessions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Updates Received</span>
                  <span className="text-white font-semibold">
                    {liveUpdates.filter(u => u.type === 'session').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Live Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Ratings</span>
                  <span className="text-white font-semibold">{ratings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Updates Received</span>
                  <span className="text-white font-semibold">
                    {liveUpdates.filter(u => u.type === 'rating').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Live Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Users</span>
                  <span className="text-white font-semibold">{users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Updates Received</span>
                  <span className="text-white font-semibold">
                    {liveUpdates.filter(u => u.type === 'user').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 