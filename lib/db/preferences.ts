import { createClient } from '@/lib/supabase/server'

export type ReminderFrequency = 'daily' | 'three_per_week' | 'weekly' | 'none'

export interface ReminderPreference {
  user_id: string
  frequency: ReminderFrequency
  updated_at: string
}

let hasLoggedMissingPreferencesTable = false

function isMissingReminderPreferencesTable(error: { code?: string } | null): boolean {
  return error?.code === 'PGRST205'
}

export async function getReminderPreference(): Promise<ReminderPreference | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('reminder_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    if (isMissingReminderPreferencesTable(error)) {
      if (!hasLoggedMissingPreferencesTable) {
        hasLoggedMissingPreferencesTable = true
      }
      return null
    }

    throw error
  }

  return data
}

export async function upsertReminderPreference(frequency: ReminderFrequency): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reminder_preferences')
    .upsert({ user_id: user.id, frequency }, { onConflict: 'user_id' })

  if (error) {
    if (isMissingReminderPreferencesTable(error)) {
      throw new Error('Reminder preferences are not available yet. Apply the latest database migrations and try again.')
    }

    throw error
  }
}
