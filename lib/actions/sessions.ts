'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SessionInsert, SessionParticipantInsert, SessionWithDetails, SessionWithParticipants } from '@/lib/types/database'

// Helper function to generate session QR code data
function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create a new session
export async function createSession(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Extract form data
  const sessionData: SessionInsert = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
    location: formData.get('location') as string,
    date_time: formData.get('date_time') as string,
    duration: parseInt(formData.get('duration') as string) || 120, // default 2 hours
    max_participants: parseInt(formData.get('max_participants') as string) || 20,
    organizer_id: user.id,
    status: 'upcoming',
    qr_code_data: generateSessionCode(),
    current_participants: 0,
    is_mvp_determined: false
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select('*')
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw new Error('Failed to create session')
  }

  // Revalidate sessions page
  revalidatePath('/sessions')
  
  return { session, success: true }
}

// Get session by ID with full details
export async function getSessionById(sessionId: string): Promise<SessionWithParticipants | null> {
  const supabase = await createClient()

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      organizer:users!sessions_organizer_id_fkey(*),
      mvp_user:users!sessions_mvp_user_id_fkey(*),
      participants:session_participants(
        *,
        user:users(*)
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return session as SessionWithParticipants
}

// Get all active sessions with basic details
export async function getActiveSessions(
  search?: string,
  locationFilter?: string,
  statusFilter?: string
): Promise<SessionWithDetails[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sessions')
    .select(`
      *,
      organizer:users!sessions_organizer_id_fkey(*),
      mvp_user:users!sessions_mvp_user_id_fkey(*),
      participants:session_participants(user:users(*)),
      participant_count:session_participants(count)
    `)
    .neq('status', 'cancelled')
    .order('date_time', { ascending: true })

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`)
  }
  
  if (locationFilter) {
    query = query.ilike('location', `%${locationFilter}%`)
  }
  
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: sessions, error } = await query

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return sessions as SessionWithDetails[]
}

// Get sessions created by a specific user
export async function getUserSessions(userId: string): Promise<SessionWithDetails[]> {
  const supabase = await createClient()

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      *,
      organizer:users!sessions_organizer_id_fkey(*),
      mvp_user:users!sessions_mvp_user_id_fkey(*),
      participants:session_participants(user:users(*)),
      participant_count:session_participants(count)
    `)
    .eq('organizer_id', userId)
    .order('date_time', { ascending: false })

  if (error) {
    console.error('Error fetching user sessions:', error)
    return []
  }

  return sessions as SessionWithDetails[]
}

// Get sessions a user is participating in
export async function getUserParticipatedSessions(userId: string): Promise<SessionWithDetails[]> {
  const supabase = await createClient()

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      *,
      organizer:users!sessions_organizer_id_fkey(*),
      mvp_user:users!sessions_mvp_user_id_fkey(*),
      participants:session_participants(user:users(*)),
      participant_count:session_participants(count)
    `)
    .eq('session_participants.user_id', userId)
    .eq('session_participants.is_confirmed', true)
    .order('date_time', { ascending: false })

  if (error) {
    console.error('Error fetching participated sessions:', error)
    return []
  }

  return sessions as SessionWithDetails[]
}

// Join a session
export async function joinSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if session exists and is joinable
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, session_participants(count)')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found')
  }

  if (session.status === 'cancelled' || session.status === 'completed') {
    throw new Error('Cannot join this session')
  }

  if (session.current_participants >= session.max_participants) {
    throw new Error('Session is full')
  }

  // Check if user is already a participant
  const { data: existingParticipant } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (existingParticipant) {
    throw new Error('Already joined this session')
  }

  // Add user as participant
  const participantData: SessionParticipantInsert = {
    session_id: sessionId,
    user_id: user.id,
    is_confirmed: true
  }

  const { error: joinError } = await supabase
    .from('session_participants')
    .insert(participantData)

  if (joinError) {
    console.error('Error joining session:', joinError)
    throw new Error('Failed to join session')
  }

  // Update participant count
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ 
      current_participants: session.current_participants + 1 
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Error updating participant count:', updateError)
  }

  // Revalidate session pages
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)

  return { success: true }
}

// Leave a session
export async function leaveSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Remove user from participants
  const { error: leaveError } = await supabase
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (leaveError) {
    console.error('Error leaving session:', leaveError)
    throw new Error('Failed to leave session')
  }

  // Update participant count
  const { data: session } = await supabase
    .from('sessions')
    .select('current_participants')
    .eq('id', sessionId)
    .single()

  if (session) {
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        current_participants: Math.max(0, session.current_participants - 1)
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating participant count:', updateError)
    }
  }

  // Revalidate session pages
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)

  return { success: true }
}

// Close a session (manual closure by organizer)
export async function closeSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify user is the organizer
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('organizer_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found')
  }

  if (session.organizer_id !== user.id) {
    throw new Error('Only the organizer can close this session')
  }

  // Update session status
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Error closing session:', updateError)
    throw new Error('Failed to close session')
  }

  // Revalidate session pages
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)

  return { success: true }
}

// Update session details (organizer only)
export async function updateSession(sessionId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify user is the organizer
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('organizer_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found')
  }

  if (session.organizer_id !== user.id) {
    throw new Error('Only the organizer can update this session')
  }

  // Extract update data
  const updateData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
    location: formData.get('location') as string,
    date_time: formData.get('date_time') as string,
    duration: parseInt(formData.get('duration') as string),
    max_participants: parseInt(formData.get('max_participants') as string),
    updated_at: new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (updateError) {
    console.error('Error updating session:', updateError)
    throw new Error('Failed to update session')
  }

  // Revalidate session pages
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)

  return { success: true }
}

// Remove participant from session (organizer only)
export async function removeParticipant(sessionId: string, participantId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify user is the organizer
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('organizer_id, current_participants')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found')
  }

  if (session.organizer_id !== user.id) {
    throw new Error('Only the organizer can remove participants')
  }

  // Remove participant
  const { error: removeError } = await supabase
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', participantId)

  if (removeError) {
    console.error('Error removing participant:', removeError)
    throw new Error('Failed to remove participant')
  }

  // Update participant count
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ 
      current_participants: Math.max(0, session.current_participants - 1)
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Error updating participant count:', updateError)
  }

  // Revalidate session pages
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)

  return { success: true }
}

// Cancel a session (organizer only)
export async function cancelSession(sessionId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify user is the organizer
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('organizer_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Session not found')
  }

  if (session.organizer_id !== user.id) {
    throw new Error('Only the organizer can cancel this session')
  }

  // Update session status
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Error cancelling session:', updateError)
    throw new Error('Failed to cancel session')
  }

  // Revalidate session pages
  revalidatePath('/sessions')
  revalidatePath(`/sessions/${sessionId}`)

  return { success: true }
} 