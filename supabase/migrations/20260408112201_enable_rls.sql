-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users enable row level security;
alter table public.streaks enable row level security;
alter table public.streak_logs enable row level security;

-- users: each user can only see and update their own row
create policy "users: select own"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own"
  on public.users for update
  using (auth.uid() = id);

-- streaks: full CRUD, scoped to owner
create policy "streaks: select own"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "streaks: insert own"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "streaks: update own"
  on public.streaks for update
  using (auth.uid() = user_id);

create policy "streaks: delete own"
  on public.streaks for delete
  using (auth.uid() = user_id);

-- streak_logs: scoped through the parent streak's owner
create policy "streak_logs: select own"
  on public.streak_logs for select
  using (
    exists (
      select 1 from public.streaks
      where streaks.id = streak_logs.streak_id
        and streaks.user_id = auth.uid()
    )
  );

create policy "streak_logs: insert own"
  on public.streak_logs for insert
  with check (
    exists (
      select 1 from public.streaks
      where streaks.id = streak_logs.streak_id
        and streaks.user_id = auth.uid()
    )
  );

create policy "streak_logs: update own"
  on public.streak_logs for update
  using (
    exists (
      select 1 from public.streaks
      where streaks.id = streak_logs.streak_id
        and streaks.user_id = auth.uid()
    )
  );

create policy "streak_logs: delete own"
  on public.streak_logs for delete
  using (
    exists (
      select 1 from public.streaks
      where streaks.id = streak_logs.streak_id
        and streaks.user_id = auth.uid()
    )
  );
