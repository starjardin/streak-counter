import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Admin client using the service-role key.
 * NEVER expose this to the browser — only import from server actions / route handlers.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables'
    )
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
