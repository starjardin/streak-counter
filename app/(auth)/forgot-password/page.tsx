'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [message, action, pending] = useActionState(forgotPassword, null)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reset your password</h1>
      <p className="text-sm text-gray-600 mb-6">
        Enter your account email and we&apos;ll send you a secure reset link.
      </p>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {message && (
          <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Sending reset link…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Remembered it?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}
