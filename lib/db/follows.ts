import { createClient } from '@/lib/supabase/server'

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('id, status')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle()

  return data
}

export async function areFriends(userId1: string, userId2: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', userId1)
    .eq('following_id', userId2)
    .eq('status', 'friends')
    .maybeSingle()

  return !!data
}
