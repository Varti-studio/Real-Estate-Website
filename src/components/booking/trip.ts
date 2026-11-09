import type { Stay } from '../../data/stays'
import type { Booking } from '../../lib/booking'
import { CARD_LABELS, type splitPlan } from '../../lib/checkout'
import { EMAIL, PRICE } from '../../data/copy'
import { priceFormat } from '../../lib/format'
import type { Quote } from '../../lib/pricing'
import type { Story } from '../../lib/stay'

/** Everything the confirmation page's blocks share, assembled once by `BookingPage`. */
export type Trip = {
  booking: Booking
  stay: Stay
  story: Story
  quote: Quote
  split: ReturnType<typeof splitPlan>
  today: string
}

/** "Ingrid", or "the host" for a stay whose story names nobody. */
export const hostName = (story: Story) => (story.host.name === 'Your host' ? 'the host' : story.host.name)

/** An email to us about this booking; there is no booking backend yet. */
export const mailUs = (subject: string, ref: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(`${subject} · ${ref}`)}`

const METHOD_LABELS = { paypal: 'PayPal', applepay: 'Apple Pay', klarna: 'Klarna' } as const

/** How it was paid: "Visa ending 3456", "PayPal". */
export function paidWith({ booking }: Trip) {
  if (booking.method !== 'card') return METHOD_LABELS[booking.method]
  const brand = booking.card?.brand ? CARD_LABELS[booking.card.brand] : 'Card'
  return booking.card ? `${brand} ending ${booking.card.last4}` : brand
}

/** The lines a guest paid for: no service-fee line (there is no Solum fee), taxes only where charged. */
export function receiptLines({ quote }: Trip): [string, string][] {
  return [
    ...quote.lines.filter((line) => line.label !== PRICE.serviceFee).map((line): [string, string] => [line.label, line.amount]),
    ...(quote.taxes ? [[PRICE.taxes, priceFormat.format(quote.taxes)] as [string, string]] : []),
  ]
}
