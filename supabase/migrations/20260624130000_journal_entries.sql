-- ============================================================
-- journal_entries
-- Daily journal entries, independent of streaks.
-- Multiple entries per day per user.
-- ============================================================
create table public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  date       date not null,
  title      text,
  body       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_user_id_idx on public.journal_entries (user_id);
create index journal_entries_date_idx on public.journal_entries (date);

-- ============================================================
-- updated_at trigger
-- ============================================================
create trigger handle_journal_entries_updated_at
  before update on public.journal_entries
  for each row
  execute function moddatetime (updated_at);

-- ============================================================
-- RLS
-- ============================================================
alter table public.journal_entries enable row level security;

create policy "journal_entries: select own"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "journal_entries: insert own"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "journal_entries: update own"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "journal_entries: delete own"
  on public.journal_entries for delete
  using (auth.uid() = user_id);
