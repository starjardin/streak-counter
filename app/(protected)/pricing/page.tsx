import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/db/subscriptions";
import { FREE_TIER_STREAK_LIMIT } from "@/lib/stripe";
import { CheckoutButton } from "./CheckoutButton";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getSubscription() : null;
  const isPro =
    subscription?.plan === "pro" && subscription?.status === "active";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
            <p className="text-sm text-gray-500 mt-1">
              Simple, transparent pricing
            </p>
          </div>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {user ? "Dashboard" : "Log in"}
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Choose your plan
          </h2>
          <p className="text-gray-500 text-lg">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free tier */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-sm">
                Perfect for getting started
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-black text-gray-900">$0</span>
              <span className="text-gray-400 ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                `Up to ${FREE_TIER_STREAK_LIMIT} streaks`,
                "Daily check-ins",
                "Basic streak history (30 days)",
                "Email reminders",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {!user ? (
              <Link
                href="/signup"
                className="w-full text-center py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Get started free
              </Link>
            ) : isPro ? (
              <div className="w-full text-center py-3 rounded-xl bg-gray-100 text-sm font-medium text-gray-400 cursor-default">
                Your previous plan
              </div>
            ) : (
              <div className="w-full text-center py-3 rounded-xl bg-blue-50 text-sm font-semibold text-blue-700 cursor-default">
                Current plan
              </div>
            )}
          </div>

          {/* Pro tier */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
              <p className="text-gray-500 text-sm">
                For serious habit builders
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-black text-gray-900">$2.99</span>
              <span className="text-gray-400 ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Unlimited streaks",
                "Everything in Free",
                "Full stats & yearly heatmap",
                "Leaderboard access",
                "Priority support",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-blue-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {!user ? (
              <Link
                href="/signup"
                className="w-full text-center py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Start free trial
              </Link>
            ) : isPro ? (
              <Link
                href="/billing"
                className="w-full text-center py-3 rounded-xl bg-blue-50 text-sm font-semibold text-blue-700 cursor-default hover:bg-blue-100 transition-colors"
              >
                Manage subscription →
              </Link>
            ) : (
              <CheckoutButton />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Payments are processed securely by Stripe. Cancel anytime.
        </p>
      </div>
    </main>
  );
}
