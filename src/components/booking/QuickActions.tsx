import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarPlus, FileDown, Luggage, MapPin, type LucideIcon } from 'lucide-react'
import { ADDRESS_NOTE, EMAIL, HOUSE_TIMES } from '../../data/copy'
import { calendarFile, downloadFile, receiptPdf } from '../../lib/bookingFiles'
import { parseCoordinates } from '../../lib/catalog'
import { addDays, formatLongDate, formatRange, formatShortDate } from '../../lib/dates'
import { priceFormat } from '../../lib/format'
import { STAGGER, fadeUp, staggerContainer } from '../../lib/motion'
import { guestsLabel } from '../checkout/TripSummary'
import { paidWith, receiptLines, type Trip } from './trip'

const TILE =
  'group flex h-full w-full flex-col items-start gap-6 rounded-card border border-line p-5 text-left transition-colors duration-500 ease-cinematic hover:border-stone-500 hover:bg-milk focus-visible:border-ink focus-visible:bg-milk lg:p-6'

/** "15:00" from "Check-in after 15:00". */
const timeOf = (s: string) => s.match(/\d{2}:\d{2}/)?.[0] ?? ''

/** Four tiles: add to calendar, directions, the receipt, and Trips. */
export function QuickActions({ trip, onTrips }: { trip: Trip; onTrips: () => void }) {
  const { booking, stay, story, quote } = trip
  const [lng, lat] = parseCoordinates(stay.coordinates)
  // Rounded like the coordinates on the stay page: the exact pin arrives 48 hours before check-in
  const directions = `https://www.openstreetmap.org/?mlat=${lat.toFixed(1)}&mlon=${lng.toFixed(1)}#map=11/${lat.toFixed(1)}/${lng.toFixed(1)}`

  const addToCalendar = () =>
    downloadFile(
      `solum-${booking.ref}.ics`,
      calendarFile({
        uid: `${booking.ref}@solum-stays.com`,
        title: `${stay.name} · Solum`,
        location: `${story.region}, ${stay.country}`,
        description: `Booking ${booking.ref}. ${HOUSE_TIMES.join('. ')}. ${ADDRESS_NOTE}`,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        from: timeOf(HOUSE_TIMES[0]),
        until: timeOf(HOUSE_TIMES[1]),
      }),
      'text/calendar',
    )

  const downloadReceipt = () =>
    downloadFile(
      `solum-receipt-${booking.ref}.pdf`,
      receiptPdf({
        title: 'Receipt',
        rows: [
          ['Reference', booking.ref],
          ['Guest', `${booking.guest.firstName} · ${booking.guest.email}`],
          ['Stay', `${stay.name}, ${stay.location}, ${stay.country}`],
          ['Dates', `${formatLongDate(booking.checkIn)} – ${formatLongDate(booking.checkOut)}`],
          ['Guests', guestsLabel(booking)],
        ],
        lines: receiptLines(trip),
        total: ['Total (EUR)', priceFormat.format(quote.due)],
        footer: [`Paid on ${formatLongDate(booking.bookedOn)} with ${paidWith(trip)}.`, `Solum Stays · ${EMAIL}`],
      }),
      'application/pdf',
    )

  const tiles: { icon: LucideIcon; title: string; sub: string; action: { onClick: () => void } | { href: string } }[] = [
    {
      icon: CalendarPlus,
      title: 'Add to calendar',
      sub: `ICS file for ${formatRange(booking.checkIn, booking.checkOut)}`,
      action: { onClick: addToCalendar },
    },
    {
      icon: MapPin,
      title: 'Get directions',
      sub: `${story.arrival.point} · exact pin ${formatShortDate(addDays(booking.checkIn, -2))}`,
      action: { href: directions },
    },
    {
      icon: FileDown,
      title: 'Download receipt',
      sub: `PDF · ${priceFormat.format(quote.due)}`,
      action: { onClick: downloadReceipt },
    },
    { icon: Luggage, title: 'View in Trips', sub: 'Manage or cancel', action: { onClick: onTrips } },
  ]

  return (
    <motion.ul
      variants={staggerContainer(STAGGER.tight)}
      aria-label="Quick actions"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 print:hidden"
    >
      {tiles.map(({ icon: Icon, title, sub, action }) => {
        const content: ReactNode = (
          <>
            <span className="flex w-full items-center justify-between">
              <span className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors duration-500 ease-cinematic group-hover:border-stone-500">
                <Icon size={18} strokeWidth={1.5} aria-hidden />
              </span>
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                aria-hidden
                className="text-stone-500 transition-[color,translate] duration-500 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ink group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:text-ink"
              />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-body tracking-[-0.01em] text-ink">{title}</span>
              <span className="font-mono text-label text-graphite-600 tabular-nums">{sub}</span>
            </span>
          </>
        )
        return (
          <motion.li key={title} variants={fadeUp}>
            {'href' in action ? (
              <a href={action.href} target="_blank" rel="noopener noreferrer" className={TILE}>
                {content}
                <span className="sr-only"> (opens a map in a new tab)</span>
              </a>
            ) : (
              <button type="button" onClick={action.onClick} className={TILE}>
                {content}
              </button>
            )}
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
