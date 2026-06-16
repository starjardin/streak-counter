import { createClient } from '@/lib/supabase/server'

export async function getUserByUsername(username: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_by_username', { lookup: username })
  if (error) throw error
  return data?.[0] ?? null
}

export async function getUserById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_by_id', { lookup: id })
  if (error) throw error
  return data?.[0] ?? null
}

export async function searchUsers(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.rpc('search_users', {
    query,
    current_user_id: user.id,
  })
  if (error) throw error
  return data ?? []
}

export async function getPublicStreaks(userId: string) {
  const supabase = await createClient()
  const { data: streaks, error } = await supabase.rpc('get_public_streaks', { owner_id: userId })
  if (error) throw error

  if (!streaks || streaks.length === 0) return []

  const streakIds = streaks.map((s) => s.id)
  const { data: logs, error: logsError } = await supabase.rpc('get_public_streak_logs', {
    streak_ids: streakIds,
  })
  if (logsError) throw logsError

  const logsByStreak: Record<string, typeof logs> = {}
  for (const log of logs ?? []) {
    if (!logsByStreak[log.streak_id]) logsByStreak[log.streak_id] = []
    logsByStreak[log.streak_id].push(log)
  }

  return streaks.map((s) => ({
    ...s,
    logs: logsByStreak[s.id] ?? [],
  }))
}
