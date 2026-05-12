'use client'

import { useAuth } from '@/context/AuthProvider'

export function UserEmail() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="text-sm font-medium text-gray-400">Loading...</p>
  }

  return <p className="text-sm font-medium text-gray-900">{user?.email ?? 'Unknown user'}</p>
}
