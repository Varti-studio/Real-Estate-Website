import { formatShortDate } from '../../lib/dates'
import { priceFormat } from '../../lib/format'
import { typeset } from '../../lib/typography'
import { hostName, paidWith, receiptLines, type Trip } from './trip'

const withYear = (iso: string) => `${formatShortDate(iso)} ${iso.slice(0, 4)}`

/** The price lines, what was paid when, and how. Amounts come from `quote()`, never stored. */
export function PaymentCard({ trip }: { trip: Trip }) {
  const { booking, stay, story, quote, split } = trip
  const splitting = booking.plan === 'split' && split

  // What is settled now, and what follows
  const rows: [string, string][] = !stay.instantBook
    ? [[`Charged once ${hostName(story)} accepts`, priceFormat.format(splitting ? split.now : quote.due)]]
    : splitting
      ? [
          [`Paid on ${withYear(booking.bookedOn)}`, priceFormat.format(split.now)],
          [`Charged on ${withYear(split.dueISO)}`, priceFormat.format(split.later)],
        ]
      : [[`Paid on ${withYear(booking.bookedOn)}`, priceFormat.format(quote.due)]]

  return (
    <section aria-labelledby="payment-title" className="flex h-full flex-col rounded-card border border-line bg-milk p-6 lg:p-8">
      <h2 id="payment-title" className="text-title tracking-[-0.02em]">
        Your payment
      </h2>

      <dl className="mt-6 font-mono text-label tabular-nums">
        {receiptLines(trip).map(([label, amount]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className="text-graphite-600">{typeset(label)}</dt>
            <dd>{amount}</dd>
          </div>
        ))}
        {/* Paid in one go, the paid line is the total; a split lists its two charges under it */}
        {splitting && (
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-4 font-sans text-body">
            <dt className="tracking-[-0.01em] text-graphite-600">Total (EUR)</dt>
            <dd className="tabular-nums">{priceFormat.format(quote.due)}</dd>
          </div>
        )}
        {rows.map(([label, amount], i) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 font-sans text-body ${
              splitting ? (i === 0 ? 'pt-3' : 'pt-1') : 'mt-3 border-t border-line pt-4'
            }`}
          >
            <dt className="font-medium tracking-[-0.01em]">{label}</dt>
            <dd className="font-medium tabular-nums">{amount}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-auto pt-6 font-mono text-label leading-[1.55] text-graphite-600">
        {paidWith(trip)} · Receipt sent to {booking.guest.email}
      </p>
    </section>
  )
}
