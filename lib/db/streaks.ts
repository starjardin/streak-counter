import { createClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/types/database.types'

export async function getStreaks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function getStreak(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createStreak(values: Omit<TablesInsert<'streaks'>, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('streaks')
    .insert({ ...values, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStreak(id: string, values: TablesUpdate<'streaks'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('streaks')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStreak(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('streaks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Convert hour+minute to total minutes from midnight.
 */
function toMinutes(hour: number, minute: number) {
  return hour * 60 + minute
}

/**
 * Check if any streak by the same user has a time range overlapping
 * the given start-to-end window. Pass `excludeId` when editing.
 */
export async function getStreakBySchedule(
  hour: number,
  minute: number,
  endHour: number,
  endMinute: number,
  excludeId?: string,
) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) return null

  const { data, error } = await supabase
    .from('streaks')
    .select('id, name, scheduled_hour, scheduled_minute, end_hour, end_minute')
    .eq('user_id', user.id)
    .not('scheduled_hour', 'is', null)
    .not('scheduled_minute', 'is', null)

  if (error) throw error

  const startMin = toMinutes(hour, minute)
  const endMin = toMinutes(endHour, endMinute)

  const conflict = data?.find((s) => {
    if (excludeId && s.id === excludeId) return false
    const sStart = toMinutes(s.scheduled_hour!, s.scheduled_minute!)
    const sEnd = s.end_hour !== null && s.end_minute !== null
      ? toMinutes(s.end_hour, s.end_minute)
      : sStart + 60 // fallback: 1-hour window
    return startMin < sEnd && sStart < endMin
  })

  return conflict ?? null
}

/**
 * Check in for today: upserts today's log and increments count if not already done.
 */
export async function checkInStreak(id: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  // Check if already checked in today
  const { data: existing, error: existingError } = await supabase
    .from('streak_logs')
    .select('is_checked')
    .eq('streak_id', id)
    .eq('date', today)
    .maybeSingle()

  if (existingError) throw existingError

  const { error: logError } = await supabase
    .from('streak_logs')
    .upsert(
      { streak_id: id, date: today, is_checked: true, checked_at: now },
      { onConflict: 'streak_id,date' },
    )

  if (logError) throw logError

  if (!existing?.is_checked) {
    const current = await getStreak(id)
    return updateStreak(id, {
      count: current.count + 1,
      last_checked_date: today,
    })
  }

  return getStreak(id)
}

export async function resetStreak(id: string) {
  return updateStreak(id, { count: 0, last_checked_date: null })
}
