import Link from 'next/link'
import { Suspense } from 'react'
import { CurrentYear } from './CurrentYear'

const features = [
  {
    icon: '🔥',
    title: 'Build streaks',
    description: 'Check in daily to grow your streak count and stay on track.',
  },
  {
    icon: '📅',
    title: 'Track your history',
    description: 'See every day you showed up with a full log of past check-ins.',
  },
  {
    icon: '🎯',
    title: 'Multiple habits',
    description: 'Create as many streaks as you need — one for each goal.',
  },
  {
    icon: '📓',
    title: 'Journal your progress',
    description: 'Add notes to each check-in and look back on your journey.',
  },
  {
    icon: '🛡️',
    title: 'Streak protection',
    description: 'Miss a day? Pro users get 5 freezes per month to keep streaks alive.',
  },
  {
    icon: '👥',
    title: 'Compete & share',
    description: 'Climb the leaderboard, follow friends, and share your streaks.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-lg">🔥 Streak Counter</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="text-6xl mb-6">🔥</div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight max-w-xl leading-tight mb-4">
          Don&apos;t break the chain.
        </h1>
        <p className="text-xl text-gray-500 max-w-md mb-10">
          Build better habits by tracking your daily streaks. Check in every day,
          watch your count grow, and stay accountable.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors shadow-sm"
          >
            Start tracking — it&apos;s free
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 px-8 py-3.5 rounded-xl"
          >
            See pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Try Pro free for 7 days. No credit card required.
        </p>
      </main>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Everything you need to build habits that stick
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start your streak today
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of users building better habits, one day at a time.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors shadow-sm"
          >
            Get started free
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            7-day free Pro trial • No credit card • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
          ©{' '}
          <Suspense fallback={null}>
            <CurrentYear />
          </Suspense>{' '}
          Streak Counter
        </div>
      </footer>
    </div>
  )
}
