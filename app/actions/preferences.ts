'use server'

import { revalidatePath } from 'next/cache'
import { upsertReminderPreference, type ReminderFrequency } from '@/lib/db/preferences'

const VALID_FREQUENCIES: ReminderFrequency[] = ['daily', 'three_per_week', 'weekly', 'none']

export async function saveReminderPreferenceAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const frequency = formData.get('frequency') as string

  if (!VALID_FREQUENCIES.includes(frequency as ReminderFrequency)) {
    return 'Invalid frequency selection'
  }

  try {
    await upsertReminderPreference(frequency as ReminderFrequency)
  } catch (err) {
    if (err instanceof Error) return err.message
    return 'Failed to save preference'
  }

  revalidatePath('/settings')
  return null
}
