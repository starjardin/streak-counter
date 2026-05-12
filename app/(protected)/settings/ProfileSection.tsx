'use client'

import { useAuth } from '@/context/AuthProvider'

export function ProfileSection() {
  const { user, loading } = useAuth()

  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase()
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : '—'

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {loading ? 'Loading...' : (user?.email ?? 'Unknown user')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Member since {loading ? '...' : memberSince}
          </p>
        </div>
      </div>
    </section>
  )
}
