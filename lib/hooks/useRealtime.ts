'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimePayload<T = any> {
  eventType: RealtimeEvent
  new: T
  old: T
  errors: any[]
}

export interface UseRealtimeOptions<T> {
  table: string
  filter?: string
  onInsert?: (payload: RealtimePayload<T>) => void
  onUpdate?: (payload: RealtimePayload<T>) => void
  onDelete?: (payload: RealtimePayload<T>) => void
  onChange?: (payload: RealtimePayload<T>) => void
}

export function useRealtime<T = any>(options: UseRealtimeOptions<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const {
    table,
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onChange
  } = options

  const handlePayload = useCallback((payload: any) => {
    const typedPayload: RealtimePayload<T> = {
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
      errors: payload.errors || []
    }

    // Call specific event handlers
    switch (payload.eventType) {
      case 'INSERT':
        onInsert?.(typedPayload)
        break
      case 'UPDATE':
        onUpdate?.(typedPayload)
        break
      case 'DELETE':
        onDelete?.(typedPayload)
        break
    }

    // Call general change handler
    onChange?.(typedPayload)
  }, [onInsert, onUpdate, onDelete, onChange])

  useEffect(() => {
    const supabase = createClient()
    
    try {
      // Create channel for the table
      const channelName = filter 
        ? `${table}:${filter}` 
        : `${table}`
      
      const realtimeChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter
          },
          handlePayload
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED')
          if (status === 'CHANNEL_ERROR') {
            setError(new Error('Failed to subscribe to real-time updates'))
          } else {
            setError(null)
          }
        })

      setChannel(realtimeChannel)

      return () => {
        supabase.removeChannel(realtimeChannel)
        setChannel(null)
        setIsConnected(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown real-time error'))
    }
  }, [table, filter, handlePayload])

  const unsubscribe = useCallback(() => {
    if (channel) {
      const supabase = createClient()
      supabase.removeChannel(channel)
      setChannel(null)
      setIsConnected(false)
    }
  }, [channel])

  return {
    isConnected,
    error,
    unsubscribe
  }
}

// Specialized hooks for specific tables
export function useSessionRealtime(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])

  const filter = sessionId ? `id=eq.${sessionId}` : undefined

  useRealtime({
    table: 'sessions',
    filter,
    onChange: (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setSession(payload.new)
      }
    }
  })

  useRealtime({
    table: 'session_participants',
    filter: sessionId ? `session_id=eq.${sessionId}` : undefined,
    onInsert: (payload) => {
      setParticipants(prev => [...prev, payload.new])
    },
    onDelete: (payload) => {
      setParticipants(prev => prev.filter(p => p.id !== payload.old?.id))
    }
  })

  return { session, participants }
}

export function useRatingsRealtime(userId?: string) {
  const [newRatings, setNewRatings] = useState<any[]>([])

  const filter = userId ? `rated_user_id=eq.${userId}` : undefined

  useRealtime({
    table: 'ratings',
    filter,
    onInsert: (payload) => {
      setNewRatings(prev => [...prev, payload.new])
    }
  })

  const markAsRead = useCallback((ratingId: string) => {
    setNewRatings(prev => prev.filter(r => r.id !== ratingId))
  }, [])

  return { newRatings, markAsRead }
}

export function useUserStatsRealtime(userId?: string) {
  const [userStats, setUserStats] = useState<any>(null)

  const filter = userId ? `id=eq.${userId}` : undefined

  useRealtime({
    table: 'users',
    filter,
    onChange: (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setUserStats(payload.new)
      }
    }
  })

  return { userStats }
} 