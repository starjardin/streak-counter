import { Suspense } from 'react'
import Link from 'next/link'
import { getReminderPreference } from '@/lib/db/preferences'
import { RemindersSection } from './RemindersSection'
import { PasswordSection } from './PasswordSection'
import { DangerSection } from './DangerSection'
import { ProfileSection } from './ProfileSection'

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <ProfileSection />

        <Suspense fallback={<RemindersSection current="none" />}>
          <RemindersSectionLoader />
        </Suspense>

        {/* Password */}
        <PasswordSection />

        {/* Danger zone (export + delete) */}
        <DangerSection />

      </div>
    </main>
  )
}

async function RemindersSectionLoader() {
  const preference = await getReminderPreference()
  const currentFrequency = preference?.frequency ?? 'none'

  return <RemindersSection current={currentFrequency} />
}
