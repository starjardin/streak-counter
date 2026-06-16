import { createClient } from '@/lib/supabase/server'
import { FriendsPage } from './FriendsPage'

async function getFriendsData(userId: string) {
  const supabase = await createClient()

  // Fetch friend IDs from follows table
  const { data: followRows } = await supabase
    .from('follows')
    .select('follower_id, following_id')
    .eq('status', 'friends')
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`)

  const friendIds = [...new Set((followRows ?? []).map((f) =>
    f.follower_id === userId ? f.following_id : f.follower_id
  ))]

  // Fetch usernames for all friend IDs
  const friends: { id: string; username: string | null }[] = []
  if (friendIds.length > 0) {
    const { data: userRows } = await supabase.rpc('get_users_by_ids', { user_ids: friendIds })

    for (const id of friendIds) {
      const u = (userRows ?? []).find((u: { id: string }) => u.id === id)
      friends.push({ id, username: u?.username ?? null })
    }
  }

  // Received pending requests
  const { data: receivedRows } = await supabase
    .from('follows')
    .select('id, follower_id')
    .eq('following_id', userId)
    .eq('status', 'pending')

  const requesterIds = [...new Set((receivedRows ?? []).map((r) => r.follower_id))]
  const { data: requesterRows } = requesterIds.length > 0
    ? await supabase.rpc('get_users_by_ids', { user_ids: requesterIds })
    : { data: [] }

  const receivedRequests = (receivedRows ?? []).map((r) => ({
    id: r.id,
    requesterId: r.follower_id,
    requesterName: ((requesterRows ?? []) as { id: string; username: string | null }[]).find((u) => u.id === r.follower_id)?.username ?? r.follower_id.slice(0, 8),
  }))

  // Sent pending requests
  const { data: sentRows } = await supabase
    .from('follows')
    .select('id, following_id')
    .eq('follower_id', userId)
    .eq('status', 'pending')

  const targetIds = [...new Set((sentRows ?? []).map((r) => r.following_id))]
  const { data: targetRows } = targetIds.length > 0
    ? await supabase.rpc('get_users_by_ids', { user_ids: targetIds })
    : { data: [] }

  const sentRequests = (sentRows ?? []).map((r) => ({
    id: r.id,
    targetId: r.following_id,
    targetName: ((targetRows ?? []) as { id: string; username: string | null }[]).find((u) => u.id === r.following_id)?.username ?? r.following_id.slice(0, 8),
  }))

  return { friends, receivedRequests, sentRequests }
}

async function getFeedData(userId: string) {
  const supabase = await createClient()
  const [feedResult, lazyResult, leaderboardResult] = await Promise.all([
    supabase.rpc('get_friend_feed', { current_user_id: userId }),
    supabase.rpc('get_lazy_friends', { current_user_id: userId }),
    supabase.rpc('get_friend_leaderboard', { current_user_id: userId }),
  ])
  return {
    feed: feedResult.data ?? [],
    lazyFriends: lazyResult.data ?? [],
    leaderboard: leaderboardResult.data ?? [],
  }
}

export default async function FriendsPageWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let data: Awaited<ReturnType<typeof getFriendsData>> & Awaited<ReturnType<typeof getFeedData>> = {
    friends: [], receivedRequests: [], sentRequests: [],
    feed: [], lazyFriends: [], leaderboard: [],
  }
  try {
    const [friendsData, feedData] = await Promise.all([
      getFriendsData(user.id),
      getFeedData(user.id),
    ])
    data = { ...friendsData, ...feedData }
  } catch {
    // follows table or queries may not be available yet
  }

  return <FriendsPage currentUserId={user.id} {...data} />
}
