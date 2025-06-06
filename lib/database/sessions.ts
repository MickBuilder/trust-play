import { createClient } from '@/lib/supabase/server'
import { Session, SessionInsert, SessionUpdate, SessionWithDetails, SessionParticipant, User } from '@/lib/types/database'

export async function createSession(sessionData: SessionInsert): Promise<Session | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating session:', error)
    return null
  }
  
  return data
}

export async function getSessionById(id: string): Promise<Session | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching session:', error)
    return null
  }
  
  return data
}

export async function getSessionByQRCode(qrCode: string): Promise<Session | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('qr_code_data', qrCode)
    .single()
  
  if (error) {
    console.error('Error fetching session by QR code:', error)
    return null
  }
  
  return data
}

export async function getSessionWithDetails(id: string): Promise<SessionWithDetails | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      organizer:users!organizer_id(*),
      mvp_user:users!mvp_user_id(*),
      participants:session_participants(
        *,
        user:users(*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching session with details:', error)
    return null
  }
  
  return {
    ...data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participants: data.participants?.map((p: any) => p.user) || [],
    participant_count: data.participants?.length || 0
  }
}

export async function getSessionWithDetailsByQRCode(qrCode: string): Promise<SessionWithDetails | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      organizer:users!organizer_id(*),
      mvp_user:users!mvp_user_id(*),
      participants:session_participants(
        *,
        user:users(*)
      )
    `)
    .eq('qr_code_data', qrCode)
    .single()
  
  if (error) {
    console.error('Error fetching session with details by QR code:', error)
    return null
  }
  
  return {
    ...data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participants: data.participants?.map((p: any) => p.user) || [],
    participant_count: data.participants?.length || 0
  }
}

export async function updateSession(id: string, updates: SessionUpdate): Promise<Session | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating session:', error)
    return null
  }
  
  return data
}

export async function deleteSession(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting session:', error)
    return false
  }
  
  return true
}

export async function addParticipantToSession(sessionId: string, userId: string): Promise<SessionParticipant | null> {
   const supabase = await createClient()
   
  // Use RPC function that handles this atomically
  const { data, error } = await supabase
    .rpc('add_participant_to_session', {
      p_session_id: sessionId,
      p_user_id: userId
    })
  
  if (error) {
    console.error('Error adding participant:', error)
    return null
  }
  
  return data
 }

export async function removeParticipantFromSession(sessionId: string, userId: string): Promise<boolean> {
   const supabase = await createClient()
   
  const { error } = await supabase
    .rpc('remove_participant_from_session', {
      p_session_id: sessionId,
      p_user_id: userId
    })
  
  if (error) {
    console.error('Error removing participant:', error)
    return false
  }
  
  return true
 }

export async function getSessionParticipants(sessionId: string): Promise<User[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('session_participants')
    .select(`
      user:users(*)
    `)
    .eq('session_id', sessionId)
    .eq('is_confirmed', true)
  
  if (error) {
    console.error('Error fetching session participants:', error)
    return []
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.map((p: any) => p.user) || []
}

export async function getUserSessions(userId: string, status?: string): Promise<Session[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('sessions')
    .select(`
      *,
      session_participants!inner(user_id)
    `)
    .eq('session_participants.user_id', userId)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query.order('date_time', { ascending: false })
  
  if (error) {
    console.error('Error fetching user sessions:', error)
    return []
  }
  
  return data || []
}

export async function getUpcomingSessions(limit: number = 10): Promise<Session[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('status', 'upcoming')
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching upcoming sessions:', error)
    return []
  }
  
  return data || []
}

export async function searchSessions(query: string, limit: number = 10): Promise<Session[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
    .eq('status', 'upcoming')
    .order('date_time', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error searching sessions:', error)
    return []
  }
  
  return data || []
}

export async function setSessionMVP(sessionId: string, mvpUserId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('sessions')
    .update({ 
      mvp_user_id: mvpUserId,
      is_mvp_determined: true
    })
    .eq('id', sessionId)
  
  if (error) {
    console.error('Error setting session MVP:', error)
    return false
  }
  
  return true
} 