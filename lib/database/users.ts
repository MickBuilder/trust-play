import { createClient } from '@/lib/supabase/server'
import { User, UserInsert, UserUpdate, UserWithStats, PlayType } from '@/lib/types/database'

export async function createUser(userData: UserInsert): Promise<User | null> {
  const supabase = await createClient()
  
  // Get the authenticated user's ID from Supabase Auth
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    console.error('No authenticated user found')
    return null
  }
  
  // Ensure the user ID matches the authenticated user's ID
  const userDataWithId = {
    ...userData,
    id: authUser.id // Set the ID to the authenticated user's ID
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert(userDataWithId)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    return null
  }
  
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single()
  
  if (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
  
  return data
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('username', username)
    .single()
  
  if (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
  
  return data
}

export async function updateUser(id: string, updates: UserUpdate): Promise<User | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user:', error)
    return null
  }
  
  return data
}

export async function getUserWithStats(id: string): Promise<UserWithStats | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      stats:user_stats(*),
      play_type_stats:user_play_type_stats(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user with stats:', error)
    return null
  }
  
  return {
    ...data,
    stats: data.stats?.[0] || undefined,
    play_type_stats: data.play_type_stats || []
  }
}

export async function updateUserRatingStats(
  userId: string, 
  newRating: number, 
  playType: PlayType
): Promise<boolean> {
  const supabase = await createClient()
  
  // This would typically be done in a database function or trigger
  // For now, we'll implement the logic here
  
  try {
    // Get current user stats
    const { data: currentUser } = await supabase
      .from('users')
      .select('current_overall_rating, total_ratings_received, play_type_distribution')
      .eq('id', userId)
      .single()
    
    if (!currentUser) return false
    
    // Calculate new average rating
    const totalRatings = currentUser.total_ratings_received + 1
    const currentTotal = currentUser.current_overall_rating * currentUser.total_ratings_received
    const newOverallRating = (currentTotal + newRating) / totalRatings
    
    // Update play type distribution
    const playTypeDistribution = currentUser.play_type_distribution as Record<PlayType, number> || {}
    playTypeDistribution[playType] = (playTypeDistribution[playType] || 0) + 1
    
    // Update user record
    await supabase
      .from('users')
      .update({
        current_overall_rating: Math.round(newOverallRating * 100) / 100, // Round to 2 decimal places
        total_ratings_received: totalRatings,
        play_type_distribution: playTypeDistribution
      })
      .eq('id', userId)
    
    return true
  } catch (error) {
    console.error('Error updating user rating stats:', error)
    return false
  }
}

export async function searchUsers(query: string, limit: number = 10): Promise<User[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select()
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit)
  
  if (error) {
    console.error('Error searching users:', error)
    return []
  }
  
  return data || []
}

export async function getTopRatedUsers(limit: number = 10): Promise<User[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select()
    .order('current_overall_rating', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching top rated users:', error)
    return []
  }
  
  return data || []
} 