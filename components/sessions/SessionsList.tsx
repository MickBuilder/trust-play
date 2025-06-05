'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionWithDetails } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  Search,
  Filter,
  Plus,
  User,
  ArrowRight,
  Loader
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'
import { cn } from '@/lib/utils'

interface SessionsListProps {
  sessions: SessionWithDetails[]
  loading?: boolean
  onRefresh?: () => void
}

export function SessionsList({ sessions, loading = false, onRefresh }: SessionsListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState('all_locations')
  
  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.organizer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    
    const matchesLocation = locationFilter === 'all_locations' || 
      session.location.toLowerCase().includes(locationFilter.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesLocation
  })

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(sessions.map(s => s.location))).slice(0, 10)

  const getSessionStatusBadge = (session: SessionWithDetails) => {
    const sessionDate = new Date(session.date_time)
    
    if (session.status === 'cancelled') {
      return <Badge variant="destructive" className="text-xs">Cancelled</Badge>
    }
    
    if (session.status === 'completed') {
      return <Badge variant="secondary" className="text-xs bg-gray-600">Completed</Badge>
    }
    
    if (isPast(sessionDate)) {
      return <Badge variant="secondary" className="text-xs bg-orange-600">Ended</Badge>
    }
    
    if (session.current_participants >= session.max_participants) {
      return <Badge variant="secondary" className="text-xs bg-red-600">Full</Badge>
    }
    
    return <Badge variant="default" className="text-xs bg-green-600">Open</Badge>
  }

  const getParticipantStatus = (session: SessionWithDetails) => {
    const percentage = (session.current_participants / session.max_participants) * 100
    return {
      count: session.current_participants,
      max: session.max_participants,
      percentage,
      color: percentage >= 90 ? 'text-red-400' : percentage >= 70 ? 'text-yellow-400' : 'text-green-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-gray-700/50 rounded animate-pulse flex-1"></div>
          <div className="h-10 bg-gray-700/50 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-700/50 rounded animate-pulse w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-700/50 rounded"></div>
                  <div className="h-4 bg-gray-700/30 rounded"></div>
                  <div className="h-4 bg-gray-700/30 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Football Sessions</h1>
          <p className="text-gray-400">
            Discover and join football sessions in your area
          </p>
        </div>
        <Button 
          onClick={() => router.push('/sessions/create')}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search sessions, locations, or organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-gray-900/50 border-gray-700/50 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all" className="text-white hover:bg-gray-800">All Status</SelectItem>
            <SelectItem value="upcoming" className="text-white hover:bg-gray-800">Upcoming</SelectItem>
            <SelectItem value="active" className="text-white hover:bg-gray-800">Active</SelectItem>
            <SelectItem value="completed" className="text-white hover:bg-gray-800">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700/50 text-white">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all_locations" className="text-white hover:bg-gray-800">All Locations</SelectItem>
            {uniqueLocations.map(location => (
              <SelectItem key={location} value={location} className="text-white hover:bg-gray-800">
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Sessions Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || locationFilter !== 'all_locations' ? 
                'Try adjusting your search criteria or filters.' : 
                'Be the first to create a session!'
              }
            </p>
            <Button 
              onClick={() => router.push('/sessions/create')}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found</span>
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                className="text-gray-400 hover:text-white"
              >
                <Loader className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const participantStatus = getParticipantStatus(session)
              const sessionDate = new Date(session.date_time)
              
              return (
                <Card 
                  key={session.id} 
                  className="glass-card hover:scale-105 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/sessions/${session.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg font-semibold line-clamp-2 group-hover:text-green-400 transition-colors">
                          {session.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {getSessionStatusBadge(session)}
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {session.organizer?.display_name || 'Organizer'}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors ml-2 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Location */}
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{session.location}</span>
                      </div>
                      
                      {/* Date and Time */}
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{format(sessionDate, 'MMM dd, yyyy')}</span>
                        <Clock className="w-4 h-4 ml-3 mr-1 text-gray-400 flex-shrink-0" />
                        <span>{format(sessionDate, 'HH:mm')}</span>
                      </div>
                      
                      {/* Participants */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span className={participantStatus.color}>
                            {participantStatus.count}/{participantStatus.max}
                          </span>
                          <span className="ml-1">players</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(sessionDate, { addSuffix: true })}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                        <div 
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            participantStatus.percentage >= 90 ? "bg-red-500" :
                            participantStatus.percentage >= 70 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${Math.min(participantStatus.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
} 