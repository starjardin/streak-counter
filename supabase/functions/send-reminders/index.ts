import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'reminders@yourdomain.com'

type Frequency = 'daily' | 'three_per_week' | 'weekly'

/** Returns true if a reminder should be sent for this frequency today. */
function shouldSendToday(frequency: Frequency): boolean {
  const day = new Date().getUTCDay() // 0=Sun 1=Mon … 6=Sat
  if (frequency === 'daily') return true
  if (frequency === 'three_per_week') return [1, 3, 5].includes(day) // Mon Wed Fri
  if (frequency === 'weekly') return day === 1 // Monday only
  return false
}

/** Returns true if the user has already checked in on any streak today. */
async function checkedInToday(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  today: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('streak_logs')
    .select('streak_id')
    .eq('is_checked', true)
    .eq('date', today)
    .in(
      'streak_id',
      supabase.from('streaks').select('id').eq('user_id', userId),
    )
    .limit(1)

  return (data?.length ?? 0) > 0
}

/** Returns true if the user has checked in on any streak this ISO week. */
async function checkedInThisWeek(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string,
  weekEnd: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('streak_logs')
    .select('streak_id')
    .eq('is_checked', true)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .in(
      'streak_id',
      supabase.from('streaks').select('id').eq('user_id', userId),
    )
    .limit(1)

  return (data?.length ?? 0) > 0
}

async function sendReminderEmail(to: string): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Streak Counter <${FROM_EMAIL}>`,
      to,
      subject: "🔥 Don't break your streak today!",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
          <h1 style="font-size:24px;margin-bottom:8px">Keep the streak alive! 🔥</h1>
          <p style="color:#4b5563;line-height:1.6">
            You haven't checked in on your streaks yet today. Head over to
            Streak Counter and keep your momentum going!
          </p>
          <a
            href="${Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://yourapp.com'}/dashboard"
            style="display:inline-block;margin-top:24px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600"
          >
            Check in now →
          </a>
          <p style="margin-top:32px;font-size:12px;color:#9ca3af">
            You're receiving this because you enabled reminders in your Streak Counter
            settings. <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://yourapp.com'}/settings" style="color:#6b7280">Manage preferences</a>.
          </p>
        </div>
      `,
    }),
  })

  return res.ok
}

Deno.serve(async (req: Request) => {
  // Only accept POST from our cron job (authenticated with service-role key)
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // ISO week bounds (Mon–Sun)
  const dayOfWeek = now.getUTCDay() === 0 ? 7 : now.getUTCDay()
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - (dayOfWeek - 1))
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = today

  // Fetch all active preferences (joins users table for email)
  const { data: prefs, error } = await supabase
    .from('reminder_preferences')
    .select('user_id, frequency, users!inner(email)')
    .neq('frequency', 'none')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const pref of prefs ?? []) {
    const frequency = pref.frequency as Frequency
    const email = (pref.users as { email: string }).email

    // 1. Is today a scheduled send day for this frequency?
    if (!shouldSendToday(frequency)) { skipped++; continue }

    // 2. Has this user already checked in (don't nag them)?
    const alreadyIn = frequency === 'weekly'
      ? await checkedInThisWeek(supabase, pref.user_id, weekStartStr, weekEndStr)
      : await checkedInToday(supabase, pref.user_id, today)

    if (alreadyIn) { skipped++; continue }

    // 3. Does the user have at least one streak?
    const { count } = await supabase
      .from('streaks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', pref.user_id)

    if (!count || count === 0) { skipped++; continue }

    const ok = await sendReminderEmail(email)
    if (ok) sent++
  }

  return new Response(JSON.stringify({ sent, skipped }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
