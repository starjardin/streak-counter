'use client'

import { useTransition } from 'react'
import { createCheckoutSession } from '@/app/actions/billing'

export function CheckoutButton() {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const error = await createCheckoutSession()
      if (error) alert(error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="w-full py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Redirecting to Stripe…' : 'Upgrade to Pro'}
    </button>
  )
}
