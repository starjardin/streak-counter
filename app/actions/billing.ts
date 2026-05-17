"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRO_PRICE_ID } from "@/lib/stripe";
import { getSubscription, upsertSubscription } from "@/lib/db/subscriptions";

export async function createCheckoutSession(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  // Reuse existing Stripe customer if we have one
  let customerId: string | undefined;
  const sub = await getSubscription();
  if (sub?.stripe_customer_id) {
    customerId = sub.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    // Persist customer id before redirecting to Stripe
    await upsertSubscription(user.id, { stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    metadata: { user_id: user.id },
  });

  if (!session.url) return "Failed to create checkout session";

  redirect(session.url);
}

export async function createBillingPortalSession(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  const sub = await getSubscription();
  if (!sub?.stripe_customer_id) return "No billing account found";

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/billing`,
  });

  redirect(portal.url);
}
