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
  const { data: { user } } = await supabase.auth.getUser()
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
 * Check in for today: upserts today's log and increments count if not already done.
 */
export async function checkInStreak(id: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Check if already checked in today
  const { data: existing } = await supabase
    .from('streak_logs')
    .select('is_checked')
    .eq('streak_id', id)
    .eq('date', today)
    .maybeSingle()

  const { error: logError } = await supabase
    .from('streak_logs')
    .upsert({ streak_id: id, date: today, is_checked: true }, { onConflict: 'streak_id,date' })

  if (logError) throw logError

  if (!existing?.is_checked) {
    const current = await getStreak(id)
    await updateStreak(id, {
      count: current.count + 1,
      last_checked_date: today,
    })
  }

  return getStreak(id)
}

export async function resetStreak(id: string) {
  return updateStreak(id, { count: 0, last_checked_date: null })
}
