-- ============================================================
-- Cron schedule: fire the send-reminders Edge Function daily
-- at 09:00 UTC.
--
-- Prerequisites:
--   1. pg_cron and pg_net extensions must be enabled in your
--      Supabase project (Dashboard → Database → Extensions).
--   2. Deploy the Edge Function first:
--        supabase functions deploy send-reminders
--   3. Replace the placeholder values below with your real
--      project ref and service-role key (or pass them via
--      Supabase Vault secrets).
-- ============================================================

-- Enable required extensions
create extension if not exists pg_cron  schema extensions;
create extension if not exists pg_net   schema extensions;

-- Schedule the job (idempotent – unschedule old one first if it exists)
select cron.unschedule('send-reminders') where exists (
  select 1 from cron.job where jobname = 'send-reminders'
);

select cron.schedule(
  'send-reminders',
  '0 9 * * *',   -- every day at 09:00 UTC
  $$
  select net.http_post(
     url     := 'https://odhdyzexafjsqzttuqom.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Store the service-role key as a database setting so the cron body above can
-- read it without hard-coding it in SQL.  Run this once manually (do NOT commit
-- the key to git):
--
--   alter database postgres set app.service_role_key = '<YOUR_SERVICE_ROLE_KEY>';
-- (Get the key from: Supabase Dashboard > Project Settings > API > service_role key)
