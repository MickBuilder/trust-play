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
      return <Badge variant="destructive" className="text-xs px-2 py-1">Cancelled</Badge>
    }
    
    if (session.status === 'completed') {
      return <Badge variant="secondary" className="text-xs bg-gray-600 px-2 py-1">Completed</Badge>
    }
    
    if (isPast(sessionDate)) {
      return <Badge variant="secondary" className="text-xs bg-orange-600 px-2 py-1">Ended</Badge>
    }
    
    if (session.current_participants >= session.max_participants) {
      return <Badge variant="secondary" className="text-xs bg-red-600 px-2 py-1">Full</Badge>
    }
    
    return <Badge variant="default" className="text-xs bg-green-600 px-2 py-1">Open</Badge>
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
      <div className="space-y-4 sm:space-y-6">
        {/* Loading skeleton - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="h-9 sm:h-10 bg-gray-700/50 rounded animate-pulse flex-1"></div>
          <div className="h-9 sm:h-10 bg-gray-700/50 rounded animate-pulse w-28 sm:w-32"></div>
          <div className="h-9 sm:h-10 bg-gray-700/50 rounded animate-pulse w-28 sm:w-32"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-5 sm:h-6 bg-gray-700/50 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-700/30 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Football Sessions</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Discover and join football sessions in your area
          </p>
        </div>
        <Button 
          onClick={() => router.push('/sessions/create')}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/25 h-10 sm:h-auto text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search sessions, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-400 h-10 sm:h-9 text-sm sm:text-base"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-gray-900/50 border-gray-700/50 text-white h-10 sm:h-9 text-sm sm:text-base">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all" className="text-white hover:bg-gray-800 text-sm">All Status</SelectItem>
            <SelectItem value="upcoming" className="text-white hover:bg-gray-800 text-sm">Upcoming</SelectItem>
            <SelectItem value="active" className="text-white hover:bg-gray-800 text-sm">Active</SelectItem>
            <SelectItem value="completed" className="text-white hover:bg-gray-800 text-sm">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700/50 text-white h-10 sm:h-9 text-sm sm:text-base">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all_locations" className="text-white hover:bg-gray-800 text-sm">All Locations</SelectItem>
            {uniqueLocations.map(location => (
              <SelectItem key={location} value={location} className="text-white hover:bg-gray-800 text-sm">
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Grid - Mobile Optimized */}
      {filteredSessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 sm:p-12 text-center">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Sessions Found</h3>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              {searchQuery || statusFilter !== 'all' || locationFilter !== 'all_locations' ? 
                'Try adjusting your search criteria or filters.' : 
                'Be the first to create a session!'
              }
            </p>
            <Button 
              onClick={() => router.push('/sessions/create')}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-10 sm:h-auto text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 px-1">
            <span>{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found</span>
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                className="text-gray-400 hover:text-white p-1 sm:p-2"
              >
                <Loader className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSessions.map((session) => {
              const sessionDate = new Date(session.date_time)
              const participantStatus = getParticipantStatus(session)
              
              return (
                <Card key={session.id} className="glass-card group hover:shadow-green-500/10 transition-all duration-300 cursor-pointer" onClick={() => router.push(`/sessions/${session.id}`)}>
                  <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-white text-base sm:text-lg group-hover:text-green-400 transition-colors leading-tight">
                        {session.title}
                      </CardTitle>
                      {getSessionStatusBadge(session)}
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{session.organizer?.display_name || 'Unknown'}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Session Info - Mobile Layout */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">
                          {format(sessionDate, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{session.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Users className={cn("w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0", participantStatus.color)} />
                        <span className="text-gray-300">
                          {participantStatus.count}/{participantStatus.max} players
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-300">{session.duration} minutes</span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    {session.description && (
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    {/* Join Button */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(sessionDate, { addSuffix: true })}
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg shadow-green-500/25 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/sessions/${session.id}`)
                        }}
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
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