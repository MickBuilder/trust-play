// Database types matching the SQL schema

export type PlayType = 'fun' | 'competitive' | 'fair_play' | 'technical' | 'social' | 'reliable'

export type SessionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'

export type RatingStatus = 'pending' | 'completed'

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  profile_image_url?: string
  phone_number?: string
  date_of_birth?: string
  bio?: string
  location?: string
  current_overall_rating: number
  play_type_distribution: Record<PlayType, number>
  total_sessions_played: number
  total_ratings_given: number
  total_ratings_received: number
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  title: string
  description?: string
  location: string
  date_time: string
  duration: number // in minutes
  max_participants: number
  current_participants: number
  qr_code_data: string
  organizer_id: string
  status: SessionStatus
  is_mvp_determined: boolean
  mvp_user_id?: string
  created_at: string
  updated_at: string
}

export interface SessionParticipant {
  id: string
  session_id: string
  user_id: string
  joined_at: string
  is_confirmed: boolean
}

export interface Rating {
  id: string
  session_id: string
  rater_id: string
  rated_user_id: string
  overall_score: number // 1-10
  play_type: PlayType
  comment?: string
  is_anonymous: boolean
  status: RatingStatus
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  user_id: string
  avg_overall_rating: number
  total_ratings_count: number
  play_type_distribution: Record<PlayType, number>
  rating_breakdown: Record<string, number> // score distribution 1-10
  mvp_count: number
  last_calculated_at: string
  created_at: string
  updated_at: string
}

export interface UserPlayTypeStats {
  id: string
  user_id: string
  play_type: PlayType
  count: number
  avg_score: number
  total_score: number
  last_received_at?: string
  created_at: string
  updated_at: string
}

// Utility types for insertions (without generated fields)
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at' | 'current_overall_rating' | 'play_type_distribution' | 'total_sessions_played' | 'total_ratings_given' | 'total_ratings_received'> & {
  current_overall_rating?: number
  play_type_distribution?: Record<PlayType, number>
  total_sessions_played?: number
  total_ratings_given?: number
  total_ratings_received?: number
}

export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at' | 'current_participants' | 'is_mvp_determined'> & {
  current_participants?: number
  is_mvp_determined?: boolean
}

export type SessionParticipantInsert = Omit<SessionParticipant, 'id' | 'joined_at' | 'is_confirmed'> & {
  is_confirmed?: boolean
}

export type RatingInsert = Omit<Rating, 'id' | 'created_at' | 'updated_at' | 'is_anonymous' | 'status'> & {
  is_anonymous?: boolean
  status?: RatingStatus
}

export type UserStatsInsert = Omit<UserStats, 'id' | 'created_at' | 'updated_at' | 'last_calculated_at'>

export type UserPlayTypeStatsInsert = Omit<UserPlayTypeStats, 'id' | 'created_at' | 'updated_at'>

// Utility types for updates (all fields optional except id)
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
export type SessionUpdate = Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>>
export type RatingUpdate = Partial<Omit<Rating, 'id' | 'created_at' | 'updated_at'>>
export type UserStatsUpdate = Partial<Omit<UserStats, 'id' | 'created_at' | 'updated_at'>>
export type UserPlayTypeStatsUpdate = Partial<Omit<UserPlayTypeStats, 'id' | 'created_at' | 'updated_at'>>

// Extended types with relations
export interface SessionWithParticipants extends Session {
  participants: (SessionParticipant & { user: User })[]
  organizer: User
  mvp_user?: User
}

export interface SessionWithDetails extends Session {
  participants: User[]
  organizer: User
  mvp_user?: User
  participant_count: number
}

export interface RatingWithDetails extends Rating {
  rater: User
  rated_user: User
  session: Session
}

export interface UserWithStats extends User {
  stats?: UserStats
  play_type_stats: UserPlayTypeStats[]
} 