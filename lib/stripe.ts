import Stripe from 'stripe'

// Dummy test key — replace with real keys from your Stripe dashboard
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_dummy_replace_with_real_key',
  { apiVersion: '2025-04-30.basil' }
)

export const STRIPE_PRO_PRICE_ID =
  process.env.STRIPE_PRO_PRICE_ID ?? 'price_dummy_replace_with_real_price_id'

export const FREE_TIER_STREAK_LIMIT = 3
