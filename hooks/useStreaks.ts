'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type Streak = Tables<'streaks'>

export function useStreaks() {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchStreaks = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setStreaks(data || [])
      setError(null)
    }
    setLoading(false)
  }, [])

  const deleteStreak = useCallback(async (streakId: string): Promise<{ error: string | null }> => {
    const supabase = createClient()
    setDeleting(streakId)

    const { error } = await supabase
      .from('streaks')
      .delete()
      .eq('id', streakId)

    if (error) {
      setDeleting(null)
      return { error: error.message }
    }

    setStreaks(prev => prev.filter(s => s.id !== streakId))
    setDeleting(null)
    return { error: null }
  }, [])

  useEffect(() => {
    fetchStreaks()

    // Subscribe to realtime changes on this user's streaks
    const supabase = createClient()
    const channel = supabase
      .channel('streaks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks' }, () => {
        fetchStreaks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchStreaks])

  return {
    streaks,
    loading,
    error,
    deleting,
    refresh: fetchStreaks,
    deleteStreak,
  }
}
