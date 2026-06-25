import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Tables } from '@/types/database.types'

export type UserWithPro = Tables<'users'> & { is_pro: boolean; passed_free_trial: boolean }

export async function isCurrentUserAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return data?.is_admin ?? false
}

export async function getAllUsers(): Promise<UserWithPro[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('users')
    .select('*, subscriptions(plan, status, free_trial_end)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((user) => {
    const sub = user.subscriptions as { plan: string; status: string; free_trial_end: string | null } | null

    const is_pro = sub?.plan === 'pro' && sub.status === 'active'

    const still_in_trial =
      sub?.plan === 'pro' &&
      sub?.status === 'trialing' &&
      sub?.free_trial_end &&
      new Date(sub.free_trial_end) > new Date()
    const passed_free_trial = !still_in_trial

    const { subscriptions: _, ...rest } = user
    return { ...rest, is_pro, passed_free_trial }
  })
}
