import { Suspense } from "react";
import Link from "next/link";
import { getSubscription } from "@/lib/db/subscriptions";
import { ManageBillingButton } from "./ManageBillingButton";

export default function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Suspense fallback={<BillingContentSkeleton />}>
        <BillingContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BillingContent({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const subscription = await getSubscription();
  const isPro =
    subscription?.plan === "pro" && subscription?.status === "active";
  const { success, canceled } = await searchParams;

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <svg
            className="w-5 h-5 text-green-600 shrink-0"
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
          <p className="text-green-800 text-sm font-medium">
            You&apos;re now on Pro! Welcome aboard.
          </p>
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">
            Checkout was canceled — no charge was made.
          </p>
        </div>
      )}

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Current plan
        </h2>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {isPro ? "Pro" : "Free"}
            </p>
            {isPro && subscription?.status && (
              <p className="text-sm text-gray-500 mt-0.5 capitalize">
                Status: {subscription.status}
              </p>
            )}
            {isPro && periodEnd && (
              <p className="text-sm text-gray-500 mt-0.5">
                Renews on {periodEnd}
              </p>
            )}
          </div>
          {isPro ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              Free
            </span>
          )}
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Pro — $2.99/mo
          </Link>
        )}
      </section>

      {isPro && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Payment method
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Update your payment method, view invoices, or cancel your
            subscription via the Stripe billing portal.
          </p>
          <ManageBillingButton />
        </section>
      )}
    </>
  );
}

function BillingContentSkeleton() {
  return (
    <>
      <section className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
        <div className="h-6 w-20 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </section>
      <section className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-full bg-gray-100 rounded" />
      </section>
    </>
  );
}
