'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRatingsRealtime } from '@/lib/hooks/useRealtime'

interface RealtimeContextValue {
  isConnected: boolean
  newRatingsCount: number
  newSessionInvites: any[]
  markRatingAsRead: (ratingId: string) => void
  markInviteAsRead: (inviteId: string) => void
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined)

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [newSessionInvites, setNewSessionInvites] = useState<any[]>([])

  // Use ratings real-time hook for the current user
  const { newRatings, markAsRead } = useRatingsRealtime(user?.id)

  // Connection status monitoring
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    
    // Create a status channel to monitor connection
    const statusChannel = supabase
      .channel('connection_status')
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(statusChannel)
    }
  }, [user])

  // Session invites real-time subscription
  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const invitesChannel = supabase
      .channel(`session_participants:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_participants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Only add if it's a new invite (not confirmed yet)
          if (!payload.new.is_confirmed) {
            setNewSessionInvites(prev => [...prev, payload.new])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'session_participants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Remove from invites if confirmed or removed
          if (payload.new.is_confirmed || payload.new.status === 'removed') {
            setNewSessionInvites(prev => 
              prev.filter(invite => invite.id !== payload.new.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(invitesChannel)
    }
  }, [user])

  const markInviteAsRead = (inviteId: string) => {
    setNewSessionInvites(prev => prev.filter(invite => invite.id !== inviteId))
  }

  const contextValue: RealtimeContextValue = {
    isConnected,
    newRatingsCount: newRatings.length,
    newSessionInvites,
    markRatingAsRead: markAsRead,
    markInviteAsRead
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider')
  }
  return context
}

// Notification component for showing real-time updates
export function RealtimeNotifications() {
  const { newRatingsCount, newSessionInvites, isConnected } = useRealtimeContext()
  
  if (!isConnected) {
    return (
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        Reconnecting...
      </div>
    )
  }

  const totalNotifications = newRatingsCount + newSessionInvites.length

  if (totalNotifications === 0) {
    return (
      <div className="text-xs text-green-400 flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Live
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-green-400 flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Live
      </div>
      {totalNotifications > 0 && (
        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalNotifications > 9 ? '9+' : totalNotifications}
        </div>
      )}
    </div>
  )
} 