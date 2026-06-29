import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from '@/lib/db/leaderboard'

function initials(email: string): string {
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function displayName(email: string): string {
  return email.split('@')[0]
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
]

function avatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-500 font-black',
  2: 'text-gray-400 font-black',
  3: 'text-amber-600 font-black',
}

const RANK_MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default async function LeaderboardPage() {
  const [supabase, entries] = await Promise.all([createClient(), getLeaderboard()])
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentUserId = user?.id ?? null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No entries yet</h2>
          <p className="text-sm text-gray-500">
            Check in on a streak to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => {
            const rank = idx + 1
            const isOwn = entry.user_id === currentUserId
            const medal = RANK_MEDALS[rank]
            const rankStyle = RANK_STYLES[rank] ?? 'text-gray-400 font-semibold'

            return (
              <div
                key={entry.streak_id}
                className={[
                  'bg-white rounded-xl border p-4 flex items-center gap-4 transition-colors',
                  isOwn
                    ? 'border-blue-300 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <div className={`w-8 text-center text-lg shrink-0 ${rankStyle}`}>
                  {medal ?? `#${rank}`}
                </div>

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(entry.user_id)}`}
                >
                  {initials(entry.user_email)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {entry.streak_name}
                    </span>
                    {isOwn && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {displayName(entry.user_email)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-blue-600 tabular-nums leading-none">
                    {entry.count}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.count === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-8">
        Showing the top {entries.length} streak{entries.length !== 1 ? 's' : ''} across all users.{' '}
        Category filtering will be available once categories are added.
      </p>
    </div>
  )
}
