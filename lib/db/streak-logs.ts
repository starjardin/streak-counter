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
