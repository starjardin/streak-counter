"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRO_PRICE_ID } from "@/lib/stripe";
import { getSubscription, upsertSubscription } from "@/lib/db/subscriptions";

async function getOrCreateStripeCustomer(userId: string, email: string | undefined): Promise<string> {
  const sub = await getSubscription();

  if (sub?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(sub.stripe_customer_id);
      if (!customer.deleted) {
        return sub.stripe_customer_id;
      }
    } catch {
      // Customer not found in current Stripe mode — recreate
    }
    // Clear invalid customer ID
    await upsertSubscription(userId, { stripe_customer_id: null });
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });
  await upsertSubscription(userId, { stripe_customer_id: customer.id });
  return customer.id;
}

export async function createCheckoutSession(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  let customerId: string;
  try {
    customerId = await getOrCreateStripeCustomer(user.id, user.email);
  } catch {
    return "Failed to set up billing customer";
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/billing?success=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      metadata: { user_id: user.id },
    });
  } catch {
    return "Failed to create checkout session";
  }

  if (!session.url) return "Failed to create checkout session";

  redirect(session.url);
}

export async function createBillingPortalSession(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  let sub;
  try {
    sub = await getSubscription();
  } catch {
    return "Failed to retrieve subscription";
  }
  if (!sub?.stripe_customer_id) return "No billing account found";

  let portal;
  try {
    portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/billing`,
    });
  } catch {
    return "Failed to create billing portal session";
  }

  redirect(portal.url);
}