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
- `proxy.ts` at root handles auth (not `middleware.ts`) — redirects unauthenticated users away from protected routes and logged-in users away from auth pages.
- Also redirects `/signin` → `/login` and `/register` → `/signup`.
- Client-side session state via `context/AuthProvider.tsx` (reads `supabase.auth.getSession()`, listens to `onAuthStateChange`).

### Supabase clients
- **Server component / Server Action**: `lib/supabase/server.ts` — uses cookie-based auth via `@supabase/ssr`
- **Browser**: `lib/supabase/client.ts` — `createBrowserClient` for client components / hooks
- **Admin (service-role)**: `lib/supabase/admin.ts` — requires `SUPABASE_SECRET_KEY` env var; used in `app/api/stripe/webhook/route.ts` and `deleteAccountAction`

### Data access
- DB queries live in `lib/db/` (streaks, streak-logs, leaderboard, preferences, subscriptions)
- Server actions live in `app/actions/` (auth, streaks, billing, preferences)
- Route handlers in `app/api/` (stripe webhook, CSV export)
- Client hooks in `hooks/` (`useStreaks.ts`, `useStreakLogs.ts`) use Supabase Realtime subscriptions

### Database
- Tables: `users`, `streaks`, `streak_logs`, `subscriptions`, `reminder_preferences`
- All user-owned tables have RLS scoped to `auth.uid()`
- Leaderboard via `get_leaderboard()` RPC (security definer)

### Edge functions
- `supabase/functions/send-reminders/` — Deno-based, uses Postmark API for email, invoked via cron (no JWT verification).

### Migrations
In `supabase/migrations/`, named `YYYYMMDDHHMMSS_description.sql`. Apply with `supabase db push`.

## Configuration quirks
- `@/*` path alias maps to project root
- `next.config.ts` has `allowedDevOrigins: ["*"]` and `cacheComponents: true`
- Tailwind v4 uses `@import "tailwindcss"` with `@theme inline` (no `tailwind.config` file)
- PostCSS uses `@tailwindcss/postcss` plugin
- Stripe API version pinned to `2026-04-22.dahlia`
- `supabase/config.toml` has `enable_confirmations = true` (email confirmation required)
- Postmark SMTP credentials must be set in **Supabase Dashboard > Authentication > Settings > SMTP Settings** for production — `config.toml` only applies locally

## Env vars required

### Next.js app (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
POSTMARK_SMTP_API_TOKEN=
POSTMARK_FROM_EMAIL=
```

### Supabase secrets (for edge functions)
```
POSTMARK_SMTP_API_TOKEN=
POSTMARK_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
```

The app URL for auth redirects is resolved in `getAppUrl()` (`app/actions/auth.ts`) — it checks (in order): `APP_URL`, `NEXT_PUBLIC_APP_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL`, then falls back to request `origin` / `host` headers.

## Key limits
- Free tier: max 3 streaks (`FREE_TIER_STREAK_LIMIT` in `lib/stripe.ts`)
- Streak name: max 50 chars
