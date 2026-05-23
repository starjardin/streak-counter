import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_dummy_replace_with_real_key',
  { apiVersion: '2026-04-22.dahlia' }
)

export const STRIPE_PRO_PRICE_ID =
  process.env.STRIPE_PRO_PRICE_ID ?? 'price_dummy_replace_with_real_price_id'

export const FREE_TIER_STREAK_LIMIT = 3
