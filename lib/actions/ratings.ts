'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { RatingInsert, RatingWithDetails, PlayType } from '@/lib/types/database'

// Submit a rating for a player in a session
export async function submitRating(data: {
  sessionId: string
  ratedUserId: string
  overallScore: number
  playType: PlayType
  comment?: string
  isAnonymous?: boolean
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate input
  if (data.overallScore < 1 || data.overallScore > 10) {
    throw new Error('Rating must be between 1 and 10')
  }

  // Check if session exists and user is a participant
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      *,
      session_participants!inner(user_id)
    `)
    .eq('id', data.sessionId)
    .eq('session_participants.user_id', user.id)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found or you are not a participant')
  }

  // Check if session is completed (ratings should only be submitted after session ends)
  if (session.status !== 'completed') {
    throw new Error('Ratings can only be submitted after the session is completed')
  }

  // Check if user is trying to rate themselves
  if (data.ratedUserId === user.id) {
    throw new Error('You cannot rate yourself')
  }

  // Check if rated user was a participant in the session
  const { data: ratedUserParticipant, error: participantError } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', data.sessionId)
    .eq('user_id', data.ratedUserId)
    .single()

  if (participantError || !ratedUserParticipant) {
    throw new Error('The user you are trying to rate was not a participant in this session')
  }

  // Check if rating already exists
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('*')
    .eq('session_id', data.sessionId)
    .eq('rater_id', user.id)
    .eq('rated_user_id', data.ratedUserId)
    .single()

  if (existingRating) {
    throw new Error('You have already rated this player for this session')
  }

  // Create the rating
  const ratingData: RatingInsert = {
    session_id: data.sessionId,
    rater_id: user.id,
    rated_user_id: data.ratedUserId,
    overall_score: data.overallScore,
    play_type: data.playType,
    comment: data.comment,
    is_anonymous: data.isAnonymous || false,
    status: 'completed'
  }

  const { data: rating, error } = await supabase
    .from('ratings')
    .insert(ratingData)
    .select('*')
    .single()

  if (error) {
    console.error('Error submitting rating:', error)
    throw new Error('Failed to submit rating')
  }

  // Update user statistics
  await updateUserStats(data.ratedUserId)

  // Revalidate relevant pages
  revalidatePath(`/sessions/${data.sessionId}`)
  revalidatePath(`/profile/${data.ratedUserId}`)
  
  return { rating, success: true }
}

// Get ratings for a specific session
export async function getSessionRatings(sessionId: string): Promise<RatingWithDetails[]> {
  const supabase = await createClient()

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!ratings_rater_id_fkey(*),
      rated_user:users!ratings_rated_user_id_fkey(*),
      session:sessions(*)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching session ratings:', error)
    return []
  }

  return ratings as RatingWithDetails[]
}

// Get ratings received by a specific user
export async function getUserRatingsReceived(userId: string): Promise<RatingWithDetails[]> {
  const supabase = await createClient()

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!ratings_rater_id_fkey(*),
      rated_user:users!ratings_rated_user_id_fkey(*),
      session:sessions(*)
    `)
    .eq('rated_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user ratings received:', error)
    return []
  }

  return ratings as RatingWithDetails[]
}

// Get ratings given by a specific user
export async function getUserRatingsGiven(userId: string): Promise<RatingWithDetails[]> {
  const supabase = await createClient()

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rater:users!ratings_rater_id_fkey(*),
      rated_user:users!ratings_rated_user_id_fkey(*),
      session:sessions(*)
    `)
    .eq('rater_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user ratings given:', error)
    return []
  }

  return ratings as RatingWithDetails[]
}

// Get pending ratings for a user (sessions they participated in but haven't rated others yet)
export async function getPendingRatings(userId: string) {
  const supabase = await createClient()

  // Get completed sessions where user participated
  const { data: completedSessions, error: sessionsError } = await supabase
    .from('sessions')
    .select(`
      *,
      session_participants!inner(user_id),
      participants:session_participants(
        *,
        user:users(*)
      )
    `)
    .eq('status', 'completed')
    .eq('session_participants.user_id', userId)

  if (sessionsError) {
    console.error('Error fetching completed sessions:', sessionsError)
    return []
  }

  // For each session, find participants that haven't been rated yet
  const pendingRatings = []

  for (const session of completedSessions) {
    // Get ratings already submitted by this user for this session
    const { data: existingRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('rated_user_id')
      .eq('session_id', session.id)
      .eq('rater_id', userId)

    if (ratingsError) {
      console.error('Error fetching existing ratings:', ratingsError)
      continue
    }

    const ratedUserIds = existingRatings.map(r => r.rated_user_id)

    // Find participants that haven't been rated (excluding the user themselves)
    const unratedParticipants = session.participants.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.user_id !== userId && !ratedUserIds.includes(p.user_id)
    )

    if (unratedParticipants.length > 0) {
      pendingRatings.push({
        session,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unratedParticipants: unratedParticipants.map((p: any) => p.user)
      })
    }
  }

  return pendingRatings
}

// Update user statistics after receiving a new rating
async function updateUserStats(userId: string) {
  const supabase = await createClient()

  // Get all ratings for this user
  const { data: ratings, error: ratingsError } = await supabase
    .from('ratings')
    .select('overall_score, play_type')
    .eq('rated_user_id', userId)
    .eq('status', 'completed')

  if (ratingsError || !ratings || ratings.length === 0) {
    return
  }

  // Calculate average overall rating
  const avgOverallRating = ratings.reduce((sum, r) => sum + r.overall_score, 0) / ratings.length

  // Calculate play type distribution
  const playTypeDistribution: Record<PlayType, number> = {
    fun: 0,
    competitive: 0,
    fair_play: 0,
    technical: 0,
    social: 0,
    reliable: 0
  }

  ratings.forEach((rating: { overall_score: number; play_type: PlayType }) => {
    playTypeDistribution[rating.play_type]++
  })

  // Convert counts to percentages
  const totalRatings = ratings.length
  const playTypes: PlayType[] = ['fun', 'competitive', 'fair_play', 'technical', 'social', 'reliable']
  playTypes.forEach(playType => {
    playTypeDistribution[playType] = Math.round((playTypeDistribution[playType] / totalRatings) * 100)
  })

  // Update user record
  const { error: updateError } = await supabase
    .from('users')
    .update({
      current_overall_rating: Math.round(avgOverallRating * 10) / 10, // Round to 1 decimal
      play_type_distribution: playTypeDistribution,
      total_ratings_received: totalRatings,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user stats:', updateError)
  }

  // Update or create user stats record
  const { error: statsError } = await supabase
    .from('user_stats')
    .upsert({
      user_id: userId,
      avg_overall_rating: avgOverallRating,
      total_ratings_count: totalRatings,
      play_type_distribution: playTypeDistribution,
      rating_breakdown: calculateRatingBreakdown(ratings),
      last_calculated_at: new Date().toISOString()
    })

  if (statsError) {
    console.error('Error updating user stats record:', statsError)
  }
}

// Helper function to calculate rating breakdown
function calculateRatingBreakdown(ratings: { overall_score: number }[]): Record<string, number> {
  const breakdown: Record<string, number> = {}
  
  for (let i = 1; i <= 10; i++) {
    breakdown[i.toString()] = 0
  }

  ratings.forEach(rating => {
    const score = Math.round(rating.overall_score).toString()
    breakdown[score] = (breakdown[score] || 0) + 1
  })

  return breakdown
}

// Delete a rating (only by the rater, within a time limit)
export async function deleteRating(ratingId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get the rating to verify ownership and timing
  const { data: rating, error: ratingError } = await supabase
    .from('ratings')
    .select('*')
    .eq('id', ratingId)
    .eq('rater_id', user.id)
    .single()

  if (ratingError || !rating) {
    throw new Error('Rating not found or you do not have permission to delete it')
  }

  // Check if rating is within deletion time limit (e.g., 24 hours)
  const ratingDate = new Date(rating.created_at)
  const now = new Date()
  const hoursSinceRating = (now.getTime() - ratingDate.getTime()) / (1000 * 60 * 60)

  if (hoursSinceRating > 24) {
    throw new Error('Ratings can only be deleted within 24 hours of submission')
  }

  // Delete the rating
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('id', ratingId)

  if (error) {
    console.error('Error deleting rating:', error)
    throw new Error('Failed to delete rating')
  }

  // Update user statistics
  await updateUserStats(rating.rated_user_id)

  // Revalidate relevant pages
  revalidatePath(`/sessions/${rating.session_id}`)
  revalidatePath(`/profile/${rating.rated_user_id}`)
  
  return { success: true }
}

// Get rating trends for a user over time
export async function getUserRatingTrends(userId: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  const supabase = await createClient()

  const timeframeDays = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365
  }

  const daysBack = timeframeDays[timeframe]
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      session:sessions(date_time)
    `)
    .eq('rated_user_id', userId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching rating trends:', error)
    return { trends: [], averages: {} }
  }

  // Group ratings by date and calculate daily averages
  const dailyRatings: Record<string, number[]> = {}
  const playTypeDaily: Record<string, Record<PlayType, number>> = {}

  ratings.forEach((rating) => {
    const date = new Date(rating.session.date_time).toISOString().split('T')[0]
    
    if (!dailyRatings[date]) {
      dailyRatings[date] = []
      playTypeDaily[date] = {
        fun: 0, competitive: 0, fair_play: 0,
        technical: 0, social: 0, reliable: 0
      }
    }
    
    dailyRatings[date].push(rating.overall_score)
    playTypeDaily[date][rating.play_type as PlayType]++
  })

  // Calculate trends
  const trends = Object.entries(dailyRatings).map(([date, scores]) => ({
    date,
    averageRating: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    totalRatings: scores.length,
    playTypeDistribution: playTypeDaily[date]
  }))

  // Calculate overall averages for the period
  const allScores = ratings.map((r) => r.overall_score)
  const overallAverage = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0

  return {
    trends,
    averages: {
      overall: Math.round(overallAverage * 10) / 10,
      period: timeframe,
      totalRatings: allScores.length
    }
  }
}

// Get detailed user performance analytics
export async function getUserPerformanceAnalytics(userId: string) {
  const supabase = await createClient()

  // Get all ratings for the user
  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      session:sessions(date_time, location, duration),
      rater:users!ratings_rater_id_fkey(display_name)
    `)
    .eq('rated_user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching performance analytics:', error)
    return null
  }

  if (!ratings || ratings.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      playTypeAnalysis: {},
      monthlyTrends: [],
      topPerformances: [],
      improvementAreas: []
    }
  }

  // Calculate basic stats
  const totalRatings = ratings.length
  const averageRating = ratings.reduce((sum: number, r) => sum + r.overall_score, 0) / totalRatings

  // Play type analysis
  const playTypeStats: Record<PlayType, { count: number; averageRating: number; totalScore: number }> = {
    fun: { count: 0, averageRating: 0, totalScore: 0 },
    competitive: { count: 0, averageRating: 0, totalScore: 0 },
    fair_play: { count: 0, averageRating: 0, totalScore: 0 },
    technical: { count: 0, averageRating: 0, totalScore: 0 },
    social: { count: 0, averageRating: 0, totalScore: 0 },
    reliable: { count: 0, averageRating: 0, totalScore: 0 }
  }

  ratings.forEach((rating) => {
    const playType = rating.play_type as PlayType
    playTypeStats[playType].count++
    playTypeStats[playType].totalScore += rating.overall_score
  })

  // Calculate averages for each play type
  Object.keys(playTypeStats).forEach(playType => {
    const stats = playTypeStats[playType as PlayType]
    stats.averageRating = stats.count > 0 ? Math.round((stats.totalScore / stats.count) * 10) / 10 : 0
  })

  // Monthly trends (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  const monthlyData: Record<string, { scores: number[]; count: number }> = {}
  
  ratings.forEach((rating) => {
    const ratingDate = new Date(rating.session.date_time)
    if (ratingDate >= sixMonthsAgo) {
      const monthKey = `${ratingDate.getFullYear()}-${String(ratingDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { scores: [], count: 0 }
      }
      
      monthlyData[monthKey].scores.push(rating.overall_score)
      monthlyData[monthKey].count++
    }
  })

  const monthlyTrends = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      averageRating: Math.round((data.scores.reduce((sum, score) => sum + score, 0) / data.count) * 10) / 10,
      totalRatings: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Top performances (ratings 8+)
  const topPerformances = ratings
    .filter((r) => r.overall_score >= 8)
    .slice(0, 10)
    .map((r) => ({
      score: r.overall_score,
      playType: r.play_type,
      comment: r.comment,
      date: r.session.date_time,
      location: r.session.location,
      raterName: r.is_anonymous ? 'Anonymous' : r.rater.display_name
    }))

  // Improvement areas (play types with lower averages)
  const improvementAreas = Object.entries(playTypeStats)
    .filter(([, stats]) => stats.count > 0 && stats.averageRating < averageRating)
    .sort((a, b) => a[1].averageRating - b[1].averageRating)
    .slice(0, 3)
    .map(([playType, stats]) => ({
      playType: playType as PlayType,
      averageRating: stats.averageRating,
      count: stats.count,
      gap: Math.round((averageRating - stats.averageRating) * 10) / 10
    }))

  return {
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    playTypeAnalysis: playTypeStats,
    monthlyTrends,
    topPerformances,
    improvementAreas
  }
}

// Get session rating summary with MVP determination
export async function getSessionRatingSummary(sessionId: string) {
  const supabase = await createClient()

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      rated_user:users!ratings_rated_user_id_fkey(id, display_name, profile_image_url)
    `)
    .eq('session_id', sessionId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error fetching session rating summary:', error)
    return null
  }

  if (!ratings || ratings.length === 0) {
    return {
      totalRatings: 0,
      participantSummaries: [],
      mvp: null,
      playTypeDistribution: {},
      averageSessionRating: 0
    }
  }

  // Group ratings by participant
  const participantRatings: Record<string, typeof ratings> = {}
  
  ratings.forEach((rating) => {
    const userId = rating.rated_user_id
    if (!participantRatings[userId]) {
      participantRatings[userId] = []
    }
    participantRatings[userId].push(rating)
  })

  // Calculate participant summaries
  const participantSummaries = Object.entries(participantRatings).map(([, userRatings]) => {
    const averageRating = userRatings.reduce((sum, r) => sum + r.overall_score, 0) / userRatings.length
    
    // Count play types for this participant
    const playTypeCounts: Record<PlayType, number> = {
      fun: 0, competitive: 0, fair_play: 0,
      technical: 0, social: 0, reliable: 0
    }
    
    userRatings.forEach(r => {
      playTypeCounts[r.play_type as PlayType]++
    })
    
    // Find most common play type
    const mostCommonPlayType = Object.entries(playTypeCounts)
      .reduce((max, [playType, count]) => count > max.count ? { playType: playType as PlayType, count } : max, 
              { playType: 'fun' as PlayType, count: 0 })

    return {
      user: userRatings[0].rated_user,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: userRatings.length,
      mostCommonPlayType: mostCommonPlayType.playType,
      playTypeCounts,
      comments: userRatings.filter(r => r.comment).map(r => r.comment)
    }
  })

  // Determine MVP (highest average rating)
  const mvp = participantSummaries.length > 0 ? participantSummaries.reduce((max, participant) => 
    participant.averageRating > max.averageRating ? participant : max
  ) : null

  // Calculate overall session play type distribution
  const sessionPlayTypeDistribution: Record<PlayType, number> = {
    fun: 0, competitive: 0, fair_play: 0,
    technical: 0, social: 0, reliable: 0
  }
  
  ratings.forEach((rating) => {
    sessionPlayTypeDistribution[rating.play_type as PlayType]++
  })

  // Convert to percentages
  const totalRatings = ratings.length
  Object.keys(sessionPlayTypeDistribution).forEach(playType => {
    sessionPlayTypeDistribution[playType as PlayType] = Math.round(
      (sessionPlayTypeDistribution[playType as PlayType] / totalRatings) * 100
    )
  })

  const averageSessionRating = ratings.reduce((sum: number, r) => sum + r.overall_score, 0) / totalRatings

  return {
    totalRatings,
    participantSummaries,
    mvp,
    playTypeDistribution: sessionPlayTypeDistribution,
    averageSessionRating: Math.round(averageSessionRating * 10) / 10
  }
}