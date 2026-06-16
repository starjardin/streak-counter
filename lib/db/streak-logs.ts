import { createClient } from '@/lib/supabase/server'

export async function getStreakLogs(streakId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('streak_logs')
    .select('*')
    .eq('streak_id', streakId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

/** Fetch only logs within the last `days` days (inclusive), filtered at the DB level. */
export async function getRecentStreakLogs(streakId: string, days: number) {
  const supabase = await createClient()
  const from = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('streak_logs')
    .select('date, is_checked, checked_at, note')
    .eq('streak_id', streakId)
    .eq('is_checked', true)
    .gte('date', from)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function getStreakLogByDate(streakId: string, date: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('streak_logs')
    .select('*')
    .eq('streak_id', streakId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getTodayLog(streakId: string) {
  const today = new Date().toISOString().split('T')[0]
  return getStreakLogByDate(streakId, today)
}

export async function upsertStreakLog(streakId: string, date: string, isChecked: boolean) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('streak_logs')
    .upsert(
      { streak_id: streakId, date, is_checked: isChecked },
      { onConflict: 'streak_id,date' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/** All checked-in logs for the authenticated user across all their streaks. */
export async function getAllCheckedLogs() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('streak_logs')
    .select('date, streak_id, streaks!inner(user_id)')
    .eq('streaks.user_id', user.id)
    .eq('is_checked', true)
    .order('date', { ascending: true })

  if (error) throw error
  // Return only the date strings
  return (data ?? []).map((r) => r.date)
}
