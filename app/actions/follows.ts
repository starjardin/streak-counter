'use server'

import { createClient } from '@/lib/supabase/server'

export async function followAction(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('follows').upsert(
    { follower_id: user.id, following_id: targetUserId, status: 'following' },
    { onConflict: 'follower_id,following_id' },
  )

  if (error) return { error: error.message }
  return { error: null }
}

export async function unfollowAction(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)

  if (error) return { error: error.message }
  return { error: null }
}

export async function sendFriendRequestAction(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('follows').upsert(
    { follower_id: user.id, following_id: targetUserId, status: 'pending' },
    { onConflict: 'follower_id,following_id' },
  )

  if (error) return { error: error.message }
  return { error: null }
}

export async function acceptFriendRequestAction(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Update the request row to 'friends'
  const { error: err1 } = await supabase
    .from('follows')
    .update({ status: 'friends' })
    .eq('follower_id', followerId)
    .eq('following_id', user.id)
    .eq('status', 'pending')

  if (err1) return { error: err1.message }

  // Ensure the reverse row exists as 'friends' too
  const { error: err2 } = await supabase.from('follows').upsert(
    { follower_id: user.id, following_id: followerId, status: 'friends' },
    { onConflict: 'follower_id,following_id' },
  )

  if (err2) return { error: err2.message }
  return { error: null }
}

export async function rejectFriendRequestAction(followerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id)
    .eq('status', 'pending')

  if (error) return { error: error.message }
  return { error: null }
}

export async function removeFriendAction(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Delete both directions
  const { error: err1 } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', friendId)
    .eq('status', 'friends')

  const { error: err2 } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', friendId)
    .eq('following_id', user.id)
    .eq('status', 'friends')

  if (err1 || err2) return { error: (err1 ?? err2)!.message }
  return { error: null }
}
