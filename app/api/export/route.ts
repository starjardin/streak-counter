import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCsv(value: string | number | null): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowToCsv(values: (string | number | null)[]): string {
  return values.map(escapeCsv).join(',')
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: streaks, error } = await supabase
    .from('streaks')
    .select('id, name, count, last_checked_date, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return new NextResponse('Failed to fetch streaks', { status: 500 })
  }

  const headers = ['id', 'name', 'count', 'last_checked_date', 'created_at', 'updated_at']
  const lines = [
    headers.join(','),
    ...(streaks ?? []).map((s) =>
      rowToCsv([s.id, s.name, s.count, s.last_checked_date, s.created_at, s.updated_at])
    ),
  ]

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="streaks-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
