import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { targetUserId, action } = await request.json()

  switch (action) {
    case 'follow': {
      const { error } = await supabase.from('follows').upsert(
        { follower_id: user.id, following_id: targetUserId, status: 'following' },
        { onConflict: 'follower_id,following_id' },
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ error: null })
    }

    case 'unfollow': {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ error: null })
    }

    case 'friend-request': {
      const { error } = await supabase.from('follows').upsert(
        { follower_id: user.id, following_id: targetUserId, status: 'pending' },
        { onConflict: 'follower_id,following_id' },
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ error: null })
    }

    case 'accept-request': {
      const { error: err1 } = await supabase
        .from('follows')
        .update({ status: 'friends' })
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
        .eq('status', 'pending')
      if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })
      const { error: err2 } = await supabase.from('follows').upsert(
        { follower_id: user.id, following_id: targetUserId, status: 'friends' },
        { onConflict: 'follower_id,following_id' },
      )
      if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
      return NextResponse.json({ error: null })
    }

    case 'reject-request': {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
        .eq('status', 'pending')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ error: null })
    }

    case 'remove-friend': {
      const { error: err1 } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .eq('status', 'friends')
      const { error: err2 } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', targetUserId)
        .eq('following_id', user.id)
        .eq('status', 'friends')
      if (err1 || err2) return NextResponse.json({ error: (err1 ?? err2)!.message }, { status: 500 })
      return NextResponse.json({ error: null })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
