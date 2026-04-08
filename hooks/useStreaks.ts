'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type Streak = Tables<'streaks'>

export function useStreaks() {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStreaks = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setStreaks(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStreaks()

    // Subscribe to realtime changes on this user's streaks
    const supabase = createClient()
    const channel = supabase
      .channel('streaks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks' }, fetchStreaks)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchStreaks])

  return { streaks, loading, error, refresh: fetchStreaks }
}
