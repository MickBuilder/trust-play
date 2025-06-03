import { createClient } from '@/lib/supabase/server'
import { Rating, RatingInsert, RatingWithDetails, PlayType } from '@/lib/types/database'
import { updateUserRatingStats } from './users'

export async function createRating(ratingData: RatingInsert): Promise<Rating | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .insert(ratingData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating rating:', error)
    return null
  }
  
  // Update user stats after successful rating creation
  await updateUserRatingStats(ratingData.rated_user_id, ratingData.overall_score, ratingData.play_type)
  
  return data
}

export async function getRatingById(id: string): Promise<Rating | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select()
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching rating:', error)
    return null
  }
  
  return data
}

export async function getRatingWithDetails(id: string): Promise<RatingWithDetails | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!rater_id(*),
      rated_user:users!rated_user_id(*),
      session:sessions(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching rating with details:', error)
    return null
  }
  
  return data
}

export async function getSessionRatings(sessionId: string): Promise<Rating[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select()
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching session ratings:', error)
    return []
  }
  
  return data || []
}

export async function getUserRatingsReceived(userId: string, limit: number = 20): Promise<RatingWithDetails[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!rater_id(*),
      rated_user:users!rated_user_id(*),
      session:sessions(*)
    `)
    .eq('rated_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching user ratings received:', error)
    return []
  }
  
  return data || []
}

export async function getUserRatingsGiven(userId: string, limit: number = 20): Promise<RatingWithDetails[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!rater_id(*),
      rated_user:users!rated_user_id(*),
      session:sessions(*)
    `)
    .eq('rater_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching user ratings given:', error)
    return []
  }
  
  return data || []
}

export async function checkIfUserCanRate(sessionId: string, raterId: string, ratedUserId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Check if rating already exists
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('session_id', sessionId)
    .eq('rater_id', raterId)
    .eq('rated_user_id', ratedUserId)
    .single()
  
  if (existingRating) {
    return false // Rating already exists
  }
  
  // Check if both users participated in the session
  const { data: participants } = await supabase
    .from('session_participants')
    .select('user_id')
    .eq('session_id', sessionId)
    .in('user_id', [raterId, ratedUserId])
  
  if (!participants || participants.length !== 2) {
    return false // One or both users didn't participate
  }
  
  // Check if session is completed
  const { data: session } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .single()
  
  if (!session || session.status !== 'completed') {
    return false // Session not completed
  }
  
  return true
}

export async function getPendingRatingsForUser(userId: string): Promise<Array<{session: any, participants: any[]}>> {
  const supabase = await createClient()
  
  // Get completed sessions where user participated but hasn't rated all other participants
  const { data: userSessions } = await supabase
    .from('session_participants')
    .select(`
      session:sessions!inner(
        id,
        title,
        status,
        date_time
      )
    `)
    .eq('user_id', userId)
    .eq('session.status', 'completed')
  
  if (!userSessions) return []
  
  const pendingRatings = []
  
  for (const userSession of userSessions) {
    const sessionId = (userSession.session as any).id
    
    // Get all participants in this session (excluding current user)
    const { data: participants } = await supabase
      .from('session_participants')
      .select(`
        user:users(*)
      `)
      .eq('session_id', sessionId)
      .neq('user_id', userId)
    
    if (!participants) continue
    
    // Check which participants haven't been rated yet
    const { data: existingRatings } = await supabase
      .from('ratings')
      .select('rated_user_id')
      .eq('session_id', sessionId)
      .eq('rater_id', userId)
    
    const ratedUserIds = new Set(existingRatings?.map(r => r.rated_user_id) || [])
    const unratedParticipants = participants.filter(p => !ratedUserIds.has((p.user as any).id))
    
    if (unratedParticipants.length > 0) {
      pendingRatings.push({
        session: userSession.session,
        participants: unratedParticipants.map(p => p.user)
      })
    }
  }
  
  return pendingRatings
}

export async function getPlayTypeStats(userId: string): Promise<Record<PlayType, { count: number, avgScore: number }>> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select('play_type, overall_score')
    .eq('rated_user_id', userId)
  
  if (error) {
    console.error('Error fetching play type stats:', error)
    return {} as Record<PlayType, { count: number, avgScore: number }>
  }
  
  const stats: Record<PlayType, { count: number, avgScore: number, totalScore: number }> = {
    fun: { count: 0, avgScore: 0, totalScore: 0 },
    competitive: { count: 0, avgScore: 0, totalScore: 0 },
    fair_play: { count: 0, avgScore: 0, totalScore: 0 },
    technical: { count: 0, avgScore: 0, totalScore: 0 },
    social: { count: 0, avgScore: 0, totalScore: 0 },
    reliable: { count: 0, avgScore: 0, totalScore: 0 }
  }
  
  data?.forEach(rating => {
    const playType = rating.play_type as PlayType
    stats[playType].count += 1
    stats[playType].totalScore += rating.overall_score
  })
  
  // Calculate averages
  Object.keys(stats).forEach(key => {
    const playType = key as PlayType
    if (stats[playType].count > 0) {
      stats[playType].avgScore = stats[playType].totalScore / stats[playType].count
    }
  })
  
  // Return without totalScore
  return Object.keys(stats).reduce((acc, key) => {
    const playType = key as PlayType
    acc[playType] = {
      count: stats[playType].count,
      avgScore: Math.round(stats[playType].avgScore * 100) / 100
    }
    return acc
  }, {} as Record<PlayType, { count: number, avgScore: number }>)
}

export async function getRecentRatings(limit: number = 10): Promise<RatingWithDetails[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!rater_id(*),
      rated_user:users!rated_user_id(*),
      session:sessions(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching recent ratings:', error)
    return []
  }
  
  return data || []
} 