-- ============================================================
-- subscriptions
-- One row per user — tracks Stripe subscription state.
-- ============================================================
create table public.subscriptions (
  user_id                uuid primary key references public.users (id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   text not null default 'free' check (plan in ('free', 'pro')),
  status                 text not null default 'active',
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure extensions.moddatetime(updated_at);

-- Seed a free-tier row when a new user is created
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_user_created_subscription
  after insert on public.users
  for each row execute procedure public.handle_new_subscription();

-- ============================================================
-- RLS
-- ============================================================
alter table public.subscriptions enable row level security;

create policy "subscriptions: select own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role (webhook) handles inserts/updates — no user-level write policies needed.
