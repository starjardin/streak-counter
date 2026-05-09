-- ============================================================
-- Leaderboard RPC
-- Returns the top 10 streaks globally, sorted by count desc.
-- Uses SECURITY DEFINER so it can bypass RLS while only
-- exposing the specific fields needed for the leaderboard.
-- ============================================================

create or replace function public.get_leaderboard()
returns table (
  streak_id   uuid,
  streak_name text,
  count       int,
  user_id     uuid,
  user_email  text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    s.id        as streak_id,
    s.name      as streak_name,
    s.count     as count,
    u.id        as user_id,
    u.email     as user_email
  from public.streaks s
  join public.users u on u.id = s.user_id
  where s.count > 0
  order by s.count desc
  limit 10;
$$;

-- Only authenticated users may call this function
revoke execute on function public.get_leaderboard() from public;
grant  execute on function public.get_leaderboard() to authenticated;
