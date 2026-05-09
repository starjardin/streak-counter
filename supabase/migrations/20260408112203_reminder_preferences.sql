-- ============================================================
-- reminder_preferences
-- One row per user storing their desired reminder frequency.
-- ============================================================

create table public.reminder_preferences (
  user_id    uuid primary key references public.users (id) on delete cascade,
  frequency  text not null default 'none'
               check (frequency in ('daily', 'three_per_week', 'weekly', 'none')),
  updated_at timestamptz not null default now()
);

create trigger reminder_preferences_updated_at
  before update on public.reminder_preferences
  for each row execute procedure extensions.moddatetime(updated_at);

-- RLS: users can only see and manage their own preference row
alter table public.reminder_preferences enable row level security;

create policy "reminder_preferences: select own"
  on public.reminder_preferences for select
  using (auth.uid() = user_id);

create policy "reminder_preferences: insert own"
  on public.reminder_preferences for insert
  with check (auth.uid() = user_id);

create policy "reminder_preferences: update own"
  on public.reminder_preferences for update
  using (auth.uid() = user_id);

create policy "reminder_preferences: delete own"
  on public.reminder_preferences for delete
  using (auth.uid() = user_id);
