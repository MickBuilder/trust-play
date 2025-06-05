'use client'

import { User } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, MapPin, Phone, Mail, Trophy, Users, Star, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ProfileViewProps {
  user: User
}

export function ProfileView({ user }: ProfileViewProps) {
  const playTypes = [
    { key: 'fun', label: 'Fun', icon: '🎉' },
    { key: 'competitive', label: 'Competitive', icon: '🏆' },
    { key: 'fair_play', label: 'Fair Play', icon: '🤝' },
    { key: 'technical', label: 'Technical', icon: '⚽' },
    { key: 'social', label: 'Social', icon: '👥' },
    { key: 'reliable', label: 'Reliable', icon: '🎯' }
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const getPlayTypePercentage = (playType: string) => {
    return user.play_type_distribution[playType as keyof typeof user.play_type_distribution] || 0
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="w-24 h-24 border-2 border-green-500/20">
              <AvatarImage src={user.profile_image_url} alt={user.display_name} />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-lg font-bold">
                {getInitials(user.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.display_name}</h2>
                  <p className="text-gray-400">@{user.username}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {user.current_overall_rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Overall Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {user.bio && (
            <p className="text-gray-300 mb-4">{user.bio}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {user.email && (
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
            )}
            {user.location && (
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                {user.location}
              </div>
            )}
            {user.phone_number && (
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                {user.phone_number}
              </div>
            )}
            {user.date_of_birth && (
              <div className="flex items-center text-gray-400">
                <CalendarDays className="w-4 h-4 mr-2" />
                Born {formatDate(user.date_of_birth)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Sessions Played</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{user.total_sessions_played}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ratings Given</CardTitle>
            <Star className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{user.total_ratings_given}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ratings Received</CardTitle>
            <Trophy className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{user.total_ratings_received}</div>
          </CardContent>
        </Card>
      </div>

      {/* Play Type Distribution */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Play Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playTypes.map((playType) => {
              const percentage = getPlayTypePercentage(playType.key)
              return (
                <div key={playType.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{playType.icon}</span>
                      <span className="text-sm font-medium text-gray-300">{playType.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-gray-600/50 text-gray-400">
                      {percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Member since:</span>
              <span className="ml-2 text-white">{formatDate(user.created_at)}</span>
            </div>
            <div>
              <span className="text-gray-400">Last updated:</span>
              <span className="ml-2 text-white">{formatDate(user.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 