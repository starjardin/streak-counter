import { Suspense } from 'react'
import { getReminderPreference } from '@/lib/db/preferences'
import { RemindersSection } from './RemindersSection'
import { PasswordSection } from './PasswordSection'
import { DangerSection } from './DangerSection'
import { ProfileSection } from './ProfileSection'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <ProfileSection />

      <Suspense fallback={<RemindersSection current="none" />}>
        <RemindersSectionLoader />
      </Suspense>

      <PasswordSection />

      <DangerSection />
    </div>
  )
}

async function RemindersSectionLoader() {
  const preference = await getReminderPreference()
  const currentFrequency = preference?.frequency ?? 'none'

  return <RemindersSection current={currentFrequency} />
}
