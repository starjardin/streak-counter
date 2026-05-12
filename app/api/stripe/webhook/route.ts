import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { upsertSubscription, getUserIdByCustomer } from '@/lib/db/subscriptions'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

function getCurrentPeriodEndIso(subscription: Stripe.Subscription): string | null {
  const latestPeriodEnd = subscription.items.data.reduce(
    (max, item) => Math.max(max, item.current_period_end),
    0
  )

  return latestPeriodEnd > 0 ? new Date(latestPeriodEnd * 1000).toISOString() : null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        if (!userId) break

        const subscriptionId = session.subscription as string | null
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await upsertSubscription(userId, {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          plan: 'pro',
          status: subscription.status,
          current_period_end: getCurrentPeriodEndIso(subscription),
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userId = await getUserIdByCustomer(customerId)
        if (!userId) break

        const plan =
          subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : 'free'

        await upsertSubscription(userId, {
          stripe_subscription_id: subscription.id,
          plan,
          status: subscription.status,
          current_period_end: getCurrentPeriodEndIso(subscription),
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userId = await getUserIdByCustomer(customerId)
        if (!userId) break

        await upsertSubscription(userId, {
          stripe_subscription_id: subscription.id,
          plan: 'free',
          status: 'canceled',
          current_period_end: getCurrentPeriodEndIso(subscription),
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const userId = await getUserIdByCustomer(customerId)
        if (!userId) break

        await upsertSubscription(userId, { status: 'past_due' })
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error('[stripe webhook] handler error:', err)
    return NextResponse.json({ error: 'Internal error processing event' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
