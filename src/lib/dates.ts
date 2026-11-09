/**
 * Date helpers on ISO `YYYY-MM-DD` strings, computed in UTC so a date never
 * shifts with the viewer's timezone. ISO strings compare correctly as text.
 */

const DAY = 86_400_000

export const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export const toISO = (time: number) => new Date(time).toISOString().slice(0, 10)

export const todayISO = () => {
  const now = new Date()
  return toISO(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export const addDays = (iso: string, days: number) => toISO(parseISO(iso) + days * DAY)

export const nightsBetween = (checkIn: string, checkOut: string) =>
  checkIn && checkOut ? Math.max(0, Math.round((parseISO(checkOut) - parseISO(checkIn)) / DAY)) : 0

/** Half-open ranges: a stay booked [10, 15) is free again for a check-in on the 15th. */
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  parseISO(aStart) < parseISO(bEnd) && parseISO(bStart) < parseISO(aEnd)

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' })

const shortFmt = fmt({ day: 'numeric', month: 'short' })
const monthFmt = fmt({ month: 'long', year: 'numeric' })
const longFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** "13 Oct" */
export const formatShortDate = (iso: string) => (iso ? shortFmt.format(parseISO(iso)) : '')
/** "12–17 Oct", or "30 Oct – 2 Nov" across months. */
export const formatRange = (from: string, to: string) =>
  from.slice(0, 7) === to.slice(0, 7)
    ? `${Number(from.slice(8))}–${formatShortDate(to)}`
    : `${formatShortDate(from)} – ${formatShortDate(to)}`

/** "Tuesday 13 October 2026" — for screen readers. */
export const formatLongDate = (iso: string) => longFmt.format(parseISO(iso))

/* ─── Calendar ──────────────────────────────────────────────────────────── */

/** A month is addressed by the ISO date of its first day, e.g. "2026-10-01". */
export const monthOf = (iso: string) => `${iso.slice(0, 7)}-01`

export const addMonths = (monthISO: string, n: number) => {
  const d = new Date(parseISO(monthISO))
  return toISO(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))
}

/** Same day-of-month `n` months away, clamped to the target month's length (31 Jan + 1 → 28 Feb). */
export const shiftMonths = (iso: string, n: number) => {
  const d = new Date(parseISO(iso))
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n + 1, 0)).getUTCDate()
  return toISO(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, Math.min(d.getUTCDate(), lastDay)))
}

export const formatMonth =(monthISO: string) => monthFmt.format(parseISO(monthISO))

export const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

/** Weeks (Monday first) of ISO dates; `null` pads days outside the month. */
export function monthGrid(monthISO: string): (string | null)[][] {
  const first = new Date(parseISO(monthISO))
  const offset = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()

  const cells: (string | null)[] = Array.from({ length: offset }, () => null)
  for (let d = 0; d < daysInMonth; d++) cells.push(addDays(monthISO, d))
  while (cells.length % 7) cells.push(null)

  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
}

/** Monday / Sunday of the week containing `iso`. */
export const weekStart = (iso: string) => addDays(iso, -((new Date(parseISO(iso)).getUTCDay() + 6) % 7))
export const weekEnd = (iso: string) => addDays(weekStart(iso), 6)
