import Link from 'next/link'

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
              Get started
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
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Start tracking — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Already have an account →
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Streak Counter
        </div>
      </footer>
    </div>
  )
}

