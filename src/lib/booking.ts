import { DEMO_BOOKINGS } from '../data/bookings'
import type { StayParams } from './stay'
import type { CardBrand, PayMethod, PayPlan } from './checkout'

/**
 * A made booking, as the confirmation page needs it. Amounts are not stored:
 * the page recomputes them with `quote()` and `splitPlan()`, so a price has
 * one version. Only the card's brand and last four digits are kept.
 */
export interface Booking extends StayParams {
  /** "HXQ-4821" */
  ref: string
  stayId: string
  guest: { firstName: string; email: string }
  /** ISO date the booking was made (the cancellation steps and the split count from it). */
  bookedOn: string
  plan: PayPlan
  method: PayMethod
  card?: { brand: CardBrand | null; last4: string }
  /** Arrival time picked at checkout, e.g. "17:00". */
  arrival?: string
}

/* ─── Reference ─────────────────────────────────────────────────────────── */

/** No I or O, so a reference read over the phone can't be mistaken for 1 or 0. */
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

/** "HXQ-4821": three letters and four digits. */
export function newReference() {
  const n = new Uint32Array(7)
  crypto.getRandomValues(n)
  const letters = Array.from(n.slice(0, 3), (v) => LETTERS[v % LETTERS.length]).join('')
  const digits = Array.from(n.slice(3), (v) => v % 10).join('')
  return `${letters}-${digits}`
}

/* ─── URL ───────────────────────────────────────────────────────────────── */

export const bookingUrl = (ref: string) => `/bookings/${encodeURIComponent(ref)}`

export const isBookingPath = (pathname: string) => /^\/bookings\/[^/]+\/?$/.test(pathname)

export const refFromPath = (pathname: string) =>
  decodeURIComponent(pathname.replace(/^\/bookings\//, '').replace(/\/$/, '')).toUpperCase()

/* ─── Storage ───────────────────────────────────────────────────────────── */

/** Session storage: the guest's name and email stay in this tab, not on the device. */
const key = (ref: string) => `solum:booking:${ref}`

export function saveBooking(booking: Booking) {
  try {
    sessionStorage.setItem(key(booking.ref), JSON.stringify(booking))
  } catch {
    /* storage blocked: the page falls back to "not found" after a reload */
  }
}

/** The booking made in this tab, else a demo booking, else undefined. */
export function loadBooking(ref: string): Booking | undefined {
  try {
    const raw = sessionStorage.getItem(key(ref))
    if (raw) {
      const parsed = JSON.parse(raw) as Booking
      if (parsed && parsed.ref === ref && typeof parsed.stayId === 'string') return parsed
    }
  } catch {
    /* blocked or malformed: fall through */
  }
  return DEMO_BOOKINGS[ref]
}
