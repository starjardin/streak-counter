import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''

  if (query.length < 2) return NextResponse.json({ users: [] })

  const { data, error } = await supabase.rpc('search_users', {
    query,
    current_user_id: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}
