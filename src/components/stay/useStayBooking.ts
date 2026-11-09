import { useEffect, useState } from 'react'
import type { Stay } from '../../data/stays'
import { unavailableDay } from '../../lib/availability'
import { nightsBetween } from '../../lib/dates'
import type { Filters } from '../../lib/filters'
import { navigate } from '../../lib/router'
import { stayParamsFromSearch, type Story } from '../../lib/stay'
import { pickDate, type DateField } from '../search/DateRangeCalendar'
import type { Guests, Range } from './BookingWidget'

/**
 * A stay's dates and guests, shared by the stay page and its checkout.
 * Dates and guests come only from the link (a search that had them, or a
 * shared stay link); without them the calendar and booking panel start
 * empty, so the visitor never sees a choice they didn't make. Both are mirrored back to
 * the link through `urlFor` with `replace`.
 */
export function useStayBooking(stay: Stay, story: Story, urlFor: (id: string, f: Partial<Filters>) => string) {
  const [initial] = useState(() => stayParamsFromSearch(new URLSearchParams(window.location.search)))
  const [range, setRange] = useState<Range>(() => ({ checkIn: initial.checkIn, checkOut: initial.checkOut }))
  const [selecting, setSelecting] = useState<DateField>('checkIn')
  const [guests, setGuests] = useState<Guests>(() => {
    // Like the dates: only what the link brings, capped at the house's capacity (children keep an adult)
    const children = Math.min(initial.children, stay.guests - 1)
    const adults = Math.min(Math.max(children ? 1 : 0, initial.adults), stay.guests - children)
    return { adults, children, pets: initial.pets && stay.petFriendly }
  })

  useEffect(() => {
    navigate(urlFor(stay.id, { ...range, ...guests }), { replace: true })
  }, [stay.id, range, guests, urlFor])

  const onPickDate = (iso: string) => {
    const next = pickDate(range, selecting, iso)
    setRange({ checkIn: next.checkIn, checkOut: next.checkOut })
    setSelecting(next.next ?? 'checkIn')
    return next.next
  }
  const onClearDates = () => {
    setRange({ checkIn: '', checkOut: '' })
    setSelecting('checkIn')
  }
  const onGuestsChange = (patch: Partial<Guests>) => setGuests((g) => ({ ...g, ...patch }))

  return {
    range,
    guests,
    selecting,
    setSelecting,
    onPickDate,
    onClearDates,
    onGuestsChange,
    nights: nightsBetween(range.checkIn, range.checkOut),
    isUnavailable: unavailableDay(stay, { checkIn: range.checkIn, selecting, minNights: story.minNights }),
    legend: `Struck-through dates are booked or past · Minimum stay ${story.minNights} nights`,
  }
}
