-- Enable moddatetime extension for auto-updating updated_at
create extension if not exists moddatetime schema extensions;

-- ============================================================
-- users
-- Mirrors auth.users — populated automatically via trigger.
-- ============================================================
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute procedure extensions.moddatetime(updated_at);

-- Automatically insert a row into public.users when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- streaks
-- ============================================================
create table public.streaks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users (id) on delete cascade,
  name              text not null,
  count             integer not null default 0,
  last_checked_date date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index streaks_user_id_idx on public.streaks (user_id);

create trigger streaks_updated_at
  before update on public.streaks
  for each row execute procedure extensions.moddatetime(updated_at);

-- ============================================================
-- streak_logs
-- One row per day per streak — tracks whether the user checked in.
-- ============================================================
create table public.streak_logs (
  id         uuid primary key default gen_random_uuid(),
  streak_id  uuid not null references public.streaks (id) on delete cascade,
  date       date not null,
  is_checked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (streak_id, date)
);

create index streak_logs_streak_id_idx on public.streak_logs (streak_id);
