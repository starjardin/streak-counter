import { createClient } from '@/lib/supabase/server'

export interface LeaderboardEntry {
  streak_id: string
  streak_name: string
  count: number
  user_id: string
  user_email: string
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_leaderboard')
  if (error) throw error
  return data ?? []
}
