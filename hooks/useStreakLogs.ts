'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

type StreakLog = Tables<'streak_logs'>

export function useStreakLogs(streakId: string) {
  const [logs, setLogs] = useState<StreakLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('streak_logs')
      .select('*')
      .eq('streak_id', streakId)
      .order('date', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setLogs(data)
    }
    setLoading(false)
  }, [streakId])

  useEffect(() => {
    if (!streakId) return
    fetchLogs()

    const supabase = createClient()
    const channel = supabase
      .channel(`streak_logs:${streakId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'streak_logs', filter: `streak_id=eq.${streakId}` },
        fetchLogs
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [streakId, fetchLogs])

  const todayLog = logs.find(
    (l) => l.date === new Date().toISOString().split('T')[0]
  )

  return { logs, todayLog, loading, error, refresh: fetchLogs }
}
