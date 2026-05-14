'use client'

import { useTransition } from 'react'
import { createBillingPortalSession } from '@/app/actions/billing'
import { Button } from '@/components/Button'

export function ManageBillingButton() {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const error = await createBillingPortalSession()
      if (error) alert(error)
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Opening portal…' : 'Manage payment method'}
    </Button>
  )
}
