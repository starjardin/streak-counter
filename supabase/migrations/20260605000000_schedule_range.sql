-- Drop slot_label — streak name is the only label.
alter table public.streaks drop column if exists slot_label;

-- Add end time columns for schedule range (from x to y).
alter table public.streaks
  add column end_hour smallint check (end_hour between 0 and 23),
  add column end_minute smallint check (end_minute between 0 and 59);
