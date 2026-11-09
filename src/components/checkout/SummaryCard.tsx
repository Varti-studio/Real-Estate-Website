import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { CONFIRMATION, PRICE } from '../../data/copy'
import type { Stay } from '../../data/stays'
import { formatRange, formatShortDate } from '../../lib/dates'
import { freeCancellationLine, type PayPlan, type splitPlan } from '../../lib/checkout'
import { priceFormat } from '../../lib/format'
import { DURATION, transition } from '../../lib/motion'
import type { Quote } from '../../lib/pricing'
import type { Story } from '../../lib/stay'
import { typeset } from '../../lib/typography'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { Rolling, type Guests, type Range } from '../stay/BookingWidget'
import { guestsLabel } from './TripSummary'

type SummaryCardProps = {
  stay: Stay
  story: Story
  range: Range
  guests: Guests
  quote: Quote | null
  plan: PayPlan
  split: ReturnType<typeof splitPlan>
  booked: string
}

/**
 * The sticky summary: the stay, the trip, the price breakdown and what is due
 * when. Every amount rolls when the dates or the plan change.
 */
export function SummaryCard({ stay, story, range, guests, quote, plan, split, booked }: SummaryCardProps) {
  const splitting = plan === 'split' && split
  const confirmation = stay.instantBook ? CONFIRMATION.instant.title : CONFIRMATION.request.title
  const info = range.checkIn ? `${freeCancellationLine(range.checkIn, booked)} · ${confirmation}` : confirmation

  return (
    <div className="rounded-frame border border-line bg-milk p-5 sm:p-6">
      {/* Stay */}
      <div className="flex gap-4">
        <ImageWithFallback
          src={stay.image.replace(/w=\d+/, 'w=400')}
          alt={stay.alt}
          wrapperClassName="aspect-[4/5] w-20 shrink-0 rounded-card sm:w-24"
        />
        <div className="flex min-w-0 flex-col gap-1.5 pt-1">
          {/* Short lines that never wrap mid-phrase in the narrow column beside the photo */}
          <span className="font-mono text-label tracking-label text-graphite-600 uppercase">{stay.type}</span>
          <span className="text-title leading-tight tracking-[-0.02em]">{stay.name}</span>
          <span className="flex items-center gap-x-1.5 font-mono text-label whitespace-nowrap text-graphite-600 tabular-nums">
            <Star size={12} strokeWidth={1.5} aria-hidden className="fill-ink text-ink" />
            <span className="text-ink">{stay.rating.toFixed(1)}</span>
            <span className="sr-only"> out of 10</span>({stay.reviews} reviews)
          </span>
          {story.badge && <span className="font-mono text-label text-graphite-600">{story.badge.label}</span>}
        </div>
      </div>

      {/* Trip */}
      <dl className="mt-5 grid gap-2 border-t border-line pt-5 text-body">
        <div className="flex justify-between gap-4">
          <dt className="text-graphite-600">Dates</dt>
          <dd className="text-right tabular-nums">
            <Rolling value={range.checkIn && range.checkOut ? `${formatRange(range.checkIn, range.checkOut)} ${range.checkOut.slice(0, 4)}` : '—'} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-graphite-600">Guests</dt>
          <dd className="text-right">
            <Rolling value={guestsLabel(guests)} />
          </dd>
        </div>
      </dl>

      {/* Price */}
      <div className="mt-5 border-t border-line pt-5">
        <h2 className="text-body tracking-[-0.01em]">Price details</h2>
        {quote ? (
          <dl className="mt-3 font-mono text-label tabular-nums">
            {[...quote.lines, { label: PRICE.taxes, amount: priceFormat.format(quote.taxes) }].map((line) => (
              <div key={line.label.replace(/\d+ nights?/, '')} className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="text-graphite-600">
                  <Rolling value={typeset(line.label)} />
                </dt>
                <dd>
                  <Rolling value={line.amount} />
                </dd>
              </div>
            ))}
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-4 font-sans text-body">
              <dt className="font-medium tracking-[-0.01em]">Total (EUR)</dt>
              <dd className="font-medium tabular-nums">
                <Rolling value={priceFormat.format(quote.due)} />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 font-mono text-label text-graphite-600">Pick your dates to see the total.</p>
        )}
        <AnimatePresence initial={false}>
          {quote && splitting && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={transition(DURATION.ui)}
              className="overflow-hidden"
            >
              <dl className="font-mono text-label tabular-nums">
                <div className="flex items-baseline justify-between gap-4 pt-3">
                  <dt className="text-graphite-600">{stay.instantBook ? 'Due now' : 'Due on acceptance'}</dt>
                  <dd>
                    <Rolling value={priceFormat.format(split.now)} />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-1.5">
                  <dt className="text-graphite-600">
                    <Rolling value={`Due ${formatShortDate(split.dueISO)}`} />
                  </dt>
                  <dd>
                    <Rolling value={priceFormat.format(split.later)} />
                  </dd>
                </div>
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info bar */}
      <p className="mt-5 rounded-card bg-sand px-4 py-3 font-mono text-label leading-[1.55] text-graphite-600 tabular-nums" aria-live="polite">
        <Rolling value={info} />
      </p>
    </div>
  )
}
