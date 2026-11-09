import type { Stay } from '../data/stays'
import { addDays, overlaps } from './dates'

/**
 * Availability on ISO dates. `booked` ranges are half-open: a stay booked
 * [10, 15) has the nights of the 10th to the 14th taken, and is free again
 * for a check-in on the 15th.
 */

/** The night starting on `iso` is taken. */
export const isBookedNight = (stay: Stay, iso: string) =>
  stay.booked.some(([from, to]) => iso >= from && iso < to)

/** Every night of [checkIn, checkOut) is free. */
export const rangeAvailable = (stay: Stay, checkIn: string, checkOut: string) =>
  !stay.booked.some(([from, to]) => overlaps(checkIn, checkOut, from, to))

/** Latest possible check-out for a check-in: the start of the next booking, or '' when open-ended. */
export function maxCheckOut(stay: Stay, checkIn: string) {
  const next = stay.booked
    .map(([from]) => from)
    .filter((from) => from > checkIn)
    .sort()[0]
  return next ?? ''
}

/**
 * Which calendar days can't be picked right now. Choosing check-in: booked
 * nights. Choosing check-out: past the next booking, or inside the minimum
 * stay. Earlier free days stay pickable, since they restart the range.
 */
export function unavailableDay(
  stay: Stay,
  { checkIn, selecting, minNights }: { checkIn: string; selecting: 'checkIn' | 'checkOut'; minNights: number },
) {
  const limit = checkIn ? maxCheckOut(stay, checkIn) : ''
  const earliestOut = checkIn ? addDays(checkIn, minNights) : ''
  return (iso: string) => {
    if (selecting === 'checkOut' && checkIn && iso > checkIn) {
      return iso < earliestOut || (!!limit && iso > limit)
    }
    return isBookedNight(stay, iso)
  }
}
