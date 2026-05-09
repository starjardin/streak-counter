'use client'

import { useActionState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { changePasswordAction } from '@/app/actions/auth'

export function PasswordSection() {
  const [result, action, pending] = useActionState(changePasswordAction, null)
  const wasPending = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (result === 'PASSWORD_CHANGED') {
        toast.success('Password updated!')
        formRef.current?.reset()
      } else if (result) {
        toast.error(result)
      }
    }
    wasPending.current = pending
  }, [pending, result])

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Change password</h2>
      <p className="text-sm text-gray-500 mb-5">Choose a new password (min. 6 characters).</p>

      <form ref={formRef} action={action} className="space-y-4 max-w-sm">
        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm new password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {result && result !== 'PASSWORD_CHANGED' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{result}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {pending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  )
}
