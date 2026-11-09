import { Star } from 'lucide-react'
import { HOUSE_TIMES } from '../../data/copy'
import { parseISO } from '../../lib/dates'
import { Link } from '../../lib/router'
import { stayUrl } from '../../lib/stay'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { guestsLabel } from '../checkout/TripSummary'
import { HostAvatar } from '../stay/HostAvatar'
import { Accented } from '../stay/text'
import { hostName, type Trip } from './trip'

/** "Mon 12 Oct 2026" */
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const longDay = (iso: string) => dayFormat.format(parseISO(iso)).replace(',', '')

/** "Check-in after 15:00" → "After 15:00" */
const houseTime = (i: number) => HOUSE_TIMES[i].replace(/^Check-?(in|out) /i, '').replace(/^./, (c) => c.toUpperCase())

/** The booked stay: photo, name, the three facts of the trip, and the host. */
export function BookedStayCard({ trip, onMessage }: { trip: Trip; onMessage: () => void }) {
  const { booking, stay, story } = trip
  const host = hostName(story)
  const href = stayUrl(stay.id, booking)

  const facts = [
    { label: 'Check-in', value: longDay(booking.checkIn), note: booking.arrival ? `Arriving around ${booking.arrival}` : houseTime(0) },
    { label: 'Checkout', value: longDay(booking.checkOut), note: houseTime(1) },
    { label: 'Guests', value: guestsLabel(booking), note: `${stay.guests} guests maximum` },
  ]

  return (
    <article aria-label="Your stay" className="grid gap-2 rounded-frame border border-line bg-milk p-2 md:grid-cols-12">
      <Link
        to={href}
        aria-label={`View ${stay.name}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-card md:col-span-5 md:aspect-auto md:min-h-80"
      >
        {/* Absolute, so the photo fills the text column's height instead of setting it */}
        <span className="absolute inset-0">
          <ImageWithFallback
            src={stay.image.replace(/w=\d+/, 'w=1000')}
            alt={stay.alt}
            sizes="(min-width: 768px) 40vw, 100vw"
            style={{ objectPosition: stay.focus }}
            wrapperClassName="h-full w-full"
            className="transition-transform duration-1400 ease-cinematic group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
          />
        </span>
      </Link>

      <div className="flex flex-col px-4 pt-4 pb-4 md:col-span-7 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
        <h2 className="text-h3 font-light">
          <Accented text={story.headline} />
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-body text-graphite-600">
          <span>{stay.type}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-label tabular-nums">
            <Star size={12} strokeWidth={1.5} aria-hidden className="fill-ink text-ink" />
            <span className="text-ink">{stay.rating.toFixed(1)}</span>
            <span className="sr-only"> out of 10,</span>({stay.reviews})
          </span>
          <span aria-hidden>·</span>
          <span>
            {stay.location}, {stay.country}
          </span>
        </p>

        <dl className="mt-8 mb-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <dt className="font-mono text-label tracking-label text-graphite-600 uppercase">{fact.label}</dt>
              <dd className="text-body tracking-[-0.01em] text-ink tabular-nums">{fact.value}</dd>
              <dd className="font-mono text-label text-graphite-600 tabular-nums">{fact.note}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <HostAvatar
              name={story.host.name === 'Your host' ? stay.name : story.host.name}
              photo={story.host.photo}
              className="size-12 text-title"
            />
            <div className="flex flex-col gap-1">
              <span className="text-body tracking-[-0.01em]">Hosted by {host}</span>
              <span className="font-mono text-label text-graphite-600 tabular-nums">
                {story.host.responds}
                {story.host.phone && (
                  <>
                    {' · '}
                    <span className="whitespace-nowrap">{story.host.phone}</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onMessage}
            aria-haspopup="dialog"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-line px-5 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk focus-visible:border-ink"
          >
            Message {host}
          </button>
        </div>
      </div>
    </article>
  )
}
