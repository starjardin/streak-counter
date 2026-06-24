-- Friend feed, accountability, and leaderboard functions

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

drop function if exists public.get_friend_leaderboard(uuid);

create function public.get_friend_leaderboard(current_user_id uuid)
returns table (
  rank bigint,
  user_id uuid,
  username text,
  streak_id uuid,
  streak_name text,
  streak_count integer
)
language sql
security definer
set search_path = ''
as $$
  with all_streaks as (
    select
      u.id as user_id,
      coalesce(u.username, u.id::text) as username,
      s.id as streak_id,
      s.name as streak_name,
      s.count as streak_count
    from public.streaks s
    join public.users u on u.id = s.user_id
    where s.user_id = current_user_id

    union all

    select
      u.id as user_id,
      coalesce(u.username, u.id::text) as username,
      s.id as streak_id,
      s.name as streak_name,
      s.count as streak_count
    from public.streaks s
    join public.follows f on f.following_id = s.user_id
    join public.users u on u.id = s.user_id
    where f.follower_id = current_user_id
      and f.status = 'friends'
      and s.is_public = true
  )
  select
    row_number() over (order by a.streak_count desc) as rank,
    a.user_id,
    a.username,
    a.streak_id,
    a.streak_name,
    a.streak_count
  from all_streaks a
  order by a.streak_count desc, a.username;
$$;
