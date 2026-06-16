-- ============================================================
-- categories
-- Users can group their streaks by category (Health, Work, etc.)
-- ============================================================
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  name       text not null,
  color      text not null default '#6366f1',
  created_at timestamptz not null default now()
);

create index categories_user_id_idx on public.categories (user_id);

alter table public.streaks
  add column category_id uuid references public.categories (id) on delete set null;

-- ============================================================
-- streak_logs: add note (journal entry) + freeze reference
-- ============================================================
alter table public.streak_logs
  add column note text;

-- ============================================================
-- streak_freezes
-- Pro users can freeze up to 5 missed days per month.
-- Each row represents one frozen day on a specific streak.
-- ============================================================
create table public.streak_freezes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  streak_id  uuid not null references public.streaks (id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  unique (streak_id, date)
);

create index streak_freezes_user_id_idx on public.streak_freezes (user_id);
create index streak_freezes_streak_id_idx on public.streak_freezes (streak_id);

-- ============================================================
-- subscriptions: add free_trial_end for 7-day Pro trial
-- ============================================================
alter table public.subscriptions
  add column free_trial_end timestamptz;

-- Auto-seed a 7-day Pro trial when a new user is created
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.subscriptions (user_id, plan, status, free_trial_end)
  values (new.id, 'pro', 'trialing', now() + interval '7 days')
  on conflict do nothing;
  return new;
end;
$$;

-- ============================================================
-- RLS: categories
-- ============================================================
alter table public.categories enable row level security;

create policy "categories: select own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories: insert own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories: update own"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "categories: delete own"
  on public.categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RLS: streak_freezes
-- ============================================================
alter table public.streak_freezes enable row level security;

create policy "streak_freezes: select own"
  on public.streak_freezes for select
  using (auth.uid() = user_id);

create policy "streak_freezes: insert own"
  on public.streak_freezes for insert
  with check (auth.uid() = user_id);

-- Only the system/service role deletes freezes — no user-level delete policy needed.
