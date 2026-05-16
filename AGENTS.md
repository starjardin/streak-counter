# streak-counter — agent instructions

## Stack
- Next.js 16 (App Router), React 19, Tailwind CSS v4
- Supabase (auth, database, realtime, edge functions)
- Stripe (subscriptions)

## Commands
| Command | Purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run lint` | ESLint (flat config: `eslint.config.mjs`) |
| `npm run gen:types` | regenerate `types/database.types.ts` from Supabase schema |

No testing framework or pre-commit hooks detected.

## Architecture

### Route groups
- `app/(auth)/` — login, signup, forgot-password, reset-password (centered layout)
- `app/(protected)/` — dashboard, stats, leaderboard, settings, billing, pricing (requires auth via `proxy.ts`)

### Auth & middleware
- `proxy.ts` at root handles auth — redirects unauthenticated users away from protected routes and logged-in users away from auth pages.
- Also redirects `/signin` → `/login` and `/register` → `/signup`.
- Client-side session state via `context/AuthProvider.tsx` (reads `supabase.auth.getSession()`, listens to `onAuthStateChange`).

### Supabase clients
- **Server component / Server Action**: `lib/supabase/server.ts` — uses cookie-based auth via `@supabase/ssr`
- **Browser**: `lib/supabase/client.ts` — `createBrowserClient` for client components / hooks
- **Admin (service-role)**: `lib/supabase/admin.ts` — requires `SUPABASE_SERVICE_ROLE_KEY` env var; used in `apps/api/stripe/webhook/route.ts` and `deleteAccountAction`

### Data access
- DB queries live in `lib/db/` (streaks, streak-logs, leaderboard, preferences, subscriptions)
- Server actions live in `app/actions/` (auth, streaks, billing, preferences)
- Route handlers in `app/api/` (stripe webhook, CSV export)
- Client hooks in `hooks/` (`useStreaks.ts`, `useStreakLogs.ts`) use Supabase Realtime subscriptions

### Database schema (Supabase + RLS)
- `users` — mirrors `auth.users` via trigger
- `streaks` — `id, user_id, name, count, last_checked_date`
- `streak_logs` — `id, streak_id, date, is_checked` (unique on `streak_id, date`)
- `subscriptions` — per-user Stripe subscription state
- `reminder_preferences` — per-user reminder frequency
- All user-owned tables have RLS scoped to `auth.uid()`
- Leaderboard via `get_leaderboard()` RPC (security definer)

### Migrations
In `supabase/migrations/`, named `YYYYMMDDHHMMSS_description.sql`. Apply with `supabase db push`.

## Configuration quirks
- `@/*` path alias maps to project root
- `next.config.ts` has `allowedDevOrigins: ["*"]` and `cacheComponents: true`
- Tailwind v4 uses `@import "tailwindcss"` (no `tailwind.config` file)
- PostCSS uses `@tailwindcss/postcss` plugin
- Stripe API version pinned to `2026-04-22.dahlia`

## Env vars required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

## Key limits
- Free tier: max 3 streaks (`FREE_TIER_STREAK_LIMIT` in `lib/stripe.ts`)
- Streak name: max 50 chars
