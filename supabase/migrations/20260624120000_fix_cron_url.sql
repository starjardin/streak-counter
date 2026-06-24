-- Fix the send-reminders cron job to point to the correct project URL
-- The edge function is deployed with --no-verify-jwt, so no auth header needed.
select cron.unschedule('send-reminders') where exists (
  select 1 from cron.job where jobname = 'send-reminders'
);

select cron.schedule(
  'send-reminders',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://odhdyzexafjsqzttuqom.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
  $$
);
