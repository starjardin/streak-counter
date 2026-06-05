-- ============================================================
-- Add optional scheduled time to streaks
-- One scheduled time per streak (or none).
-- ============================================================
alter table public.streaks
  add column scheduled_hour   smallint check (scheduled_hour between 0 and 23),
  add column scheduled_minute smallint check (scheduled_minute between 0 and 59),
  add column time_enforced    boolean not null default false;

-- ============================================================
-- Add checked_at timestamp to streak_logs
-- Records the exact moment the user pressed "Check In".
-- ============================================================
alter table public.streak_logs
  add column checked_at timestamptz;
