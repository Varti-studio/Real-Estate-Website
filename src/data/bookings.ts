import type { Booking } from '../lib/booking'

/**
 * Demo bookings, so a confirmation page always renders without a backend.
 * Bookings made at checkout live in session storage (`lib/booking.ts`).
 */
export const DEMO_BOOKINGS: Record<string, Booking> = {
  'HXQ-4821': {
    ref: 'HXQ-4821',
    stayId: 'canopy-treehouse',
    checkIn: '2026-10-12',
    checkOut: '2026-10-17',
    adults: 2,
    children: 0,
    pets: false,
    guest: { firstName: 'Olena', email: 'olena@example.com' },
    bookedOn: '2026-09-22',
    plan: 'full',
    method: 'card',
    card: { brand: 'visa', last4: '3456' },
  },
}
