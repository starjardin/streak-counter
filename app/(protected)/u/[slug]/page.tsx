import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByUsername, getUserById, getPublicStreaks } from '@/lib/db/public-profile'
import { PublicProfile } from './PublicProfile'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  let profile = await getUserByUsername(slug)
  if (!profile) {
    profile = await getUserById(slug)
  }
  if (!profile) notFound()

  if (profile.id === currentUser.id) redirect('/dashboard')

  const publicStreaks = await getPublicStreaks(profile.id)
  const ownerName = profile.username ?? profile.id.slice(0, 8)

  // Fetch relationship status
  let initialRelationship: string | null = null
  try {
    const { data: relationship } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    initialRelationship = relationship?.status ?? null
  } catch {
    // follows table or query may not be available
  }

  return (
    <PublicProfile
      ownerId={profile.id}
      ownerName={ownerName}
      streaks={publicStreaks}
      initialRelationship={initialRelationship}
    />
  )
}
