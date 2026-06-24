-- Social features: public profiles + follow system

-- Add public visibility toggle to streaks
alter table public.streaks add column is_public boolean not null default false;

create policy "streaks: select public"
  on public.streaks for select
  using (is_public = true);

-- Follows table: one-directional follow + mutual friend relationships
-- status: 'following' (one-directional), 'pending' (friend request sent), 'friends' (mutual)
create table public.follows (
  id uuid not null default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'following' check (status in ('following', 'pending', 'friends')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique pair
alter table public.follows add constraint follows_pair_unique unique (follower_id, following_id);

-- Prevent self-follow
alter table public.follows add constraint follows_no_self check (follower_id <> following_id);

-- Index for common queries
create index follows_follower_idx on public.follows (follower_id);
create index follows_following_idx on public.follows (following_id);

-- Updated_at trigger
create trigger set_follows_updated_at
  before update on public.follows
  for each row execute function moddatetime (updated_at);

-- Enable RLS
alter table public.follows enable row level security;

-- RLS: select own follows (incoming or outgoing)
create policy "follows: select own"
  on public.follows for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

-- RLS: insert as self
create policy "follows: insert own"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- RLS: update where you are follower or following
create policy "follows: update as follower"
  on public.follows for update
  using (auth.uid() = follower_id);

create policy "follows: update as following"
  on public.follows for update
  using (auth.uid() = following_id);

-- RLS: delete where you are follower or following
create policy "follows: delete as follower"
  on public.follows for delete
  using (auth.uid() = follower_id);

create policy "follows: delete as following"
  on public.follows for delete
  using (auth.uid() = following_id);

-- Security definer functions for cross-user profile access
create or replace function public.get_user_by_username(lookup text)
returns table (id uuid, username text)
language sql
security definer
set search_path = ''
as $$
  select id, username from public.users
  where username = lookup
  limit 1;
$$;

create or replace function public.get_user_by_id(lookup uuid)
returns table (id uuid, username text)
language sql
security definer
set search_path = ''
as $$
  select id, username from public.users
  where id = lookup
  limit 1;
$$;

create or replace function public.get_users_by_ids(user_ids uuid[])
returns table (id uuid, username text)
language sql
security definer
set search_path = ''
as $$
  select id, username from public.users
  where id = any(user_ids);
$$;

create or replace function public.search_users(query text, current_user_id uuid)
returns table (id uuid, username text)
language sql
security definer
set search_path = ''
as $$
  select id, username from public.users
  where username ilike '%' || query || '%'
    and id <> current_user_id
    and username is not null
  limit 20;
$$;

create or replace function public.get_public_streaks(owner_id uuid)
returns table (
  id uuid,
  name text,
  count integer,
  last_checked_date text,
  created_at timestamptz,
  category_id uuid
)
language sql
security definer
set search_path = ''
as $$
  select id, name, count, last_checked_date::text, created_at, category_id
  from public.streaks
  where user_id = owner_id and is_public = true;
$$;

create or replace function public.get_public_streak_logs(streak_ids uuid[])
returns table (
  streak_id uuid,
  date text,
  is_checked boolean,
  checked_at text,
  note text
)
language sql
security definer
set search_path = ''
as $$
  select sl.streak_id, sl.date::text, sl.is_checked, sl.checked_at::text, sl.note
  from public.streak_logs sl
  where sl.streak_id = any(streak_ids);
$$;

-- Feed: recent check-in activity from friends
create or replace function public.get_friend_feed(current_user_id uuid)
returns table (
  friend_id uuid,
  friend_name text,
  streak_id uuid,
  streak_name text,
  checked_at text,
  date text,
  note text
)
language sql
security definer
set search_path = ''
as $$
  select
    u.id as friend_id,
    coalesce(u.username, u.id::text) as friend_name,
    s.id as streak_id,
    s.name as streak_name,
    sl.checked_at::text,
    sl.date::text,
    sl.note
  from public.streak_logs sl
  join public.streaks s on s.id = sl.streak_id
  join public.follows f on f.following_id = s.user_id
  join public.users u on u.id = s.user_id
  where f.follower_id = current_user_id
    and f.status = 'friends'
    and sl.is_checked = true
    and sl.checked_at is not null
  order by sl.checked_at desc
  limit 50;
$$;

-- Friends who haven't checked in today (accountability)
create or replace function public.get_lazy_friends(current_user_id uuid)
returns table (
  friend_id uuid,
  friend_name text,
  streak_id uuid,
  streak_name text,
  last_checked_date text
)
language sql
security definer
set search_path = ''
as $$
  select
    u.id as friend_id,
    coalesce(u.username, u.id::text) as friend_name,
    s.id as streak_id,
    s.name as streak_name,
    s.last_checked_date::text
  from public.streaks s
  join public.follows f on f.following_id = s.user_id
  join public.users u on u.id = s.user_id
  where f.follower_id = current_user_id
    and f.status = 'friends'
    and (s.last_checked_date is null or s.last_checked_date::date < current_date)
    and s.count > 0
  order by s.last_checked_date asc nulls first;
$$;

-- Leaderboard: all streaks for current user and friends
create or replace function public.get_friend_leaderboard(current_user_id uuid)
returns table (
  user_id uuid,
  username text,
  streak_id uuid,
  streak_name text,
  streak_count integer,
  last_checked_date text
)
language sql
security definer
set search_path = ''
as $$
  -- Current user's streaks
  select
    u.id as user_id,
    coalesce(u.username, u.id::text) as username,
    s.id as streak_id,
    s.name as streak_name,
    s.count as streak_count,
    s.last_checked_date::text
  from public.streaks s
  join public.users u on u.id = s.user_id
  where s.user_id = current_user_id

  union all

  -- Friends' streaks (public or friend-visible)
  select
    u.id as user_id,
    coalesce(u.username, u.id::text) as username,
    s.id as streak_id,
    s.name as streak_name,
    s.count as streak_count,
    s.last_checked_date::text
  from public.streaks s
  join public.follows f on f.following_id = s.user_id
  join public.users u on u.id = s.user_id
  where f.follower_id = current_user_id
    and f.status = 'friends'
    and s.is_public = true
  order by username, streak_name;
$$;
