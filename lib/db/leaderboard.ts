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

  if (error) {
    // If the RPC has not been deployed yet, keep the page usable with an empty state.
    if (error.code === 'PGRST202') {
      console.error('get_leaderboard RPC is missing in Supabase schema cache', error)
      return []
    }

    throw error
  }

  return data ?? []
}
