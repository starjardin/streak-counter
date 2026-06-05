import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Tables } from '@/types/database.types'

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

export async function getAllUsers(): Promise<Tables<'users'>[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
