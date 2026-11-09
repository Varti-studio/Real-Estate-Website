import { PRICE } from '../data/copy'
import type { Stay } from '../data/stays'
import { priceFormat } from './format'

export interface QuoteLine {
  label: string
  /** Formatted amount, e.g. "€1,140" or "€0". */
  amount: string
  /** Short note under the amount, if a line needs one. */
  note?: string
}

export interface Quote {
  nights: number
  lines: QuoteLine[]
  /** Before taxes, as the stay page shows it. */
  total: number
  /** Local taxes, added at checkout. */
  taxes: number
  /** What the guest pays: `total + taxes`. */
  due: number
}

/** The booking breakdown, in EUR. The stay page stops at `total`; checkout adds `taxes`. */
export function quote(
  stay: Stay,
  { cleaningFee, taxRate = 0 }: { cleaningFee: number; taxRate?: number },
  nights: number,
): Quote {
  const stayTotal = stay.pricePerNight * nights
  const total = stayTotal + cleaningFee
  const taxes = Math.round(total * taxRate)
  return {
    nights,
    lines: [
      {
        label: `${priceFormat.format(stay.pricePerNight)} × ${nights} ${nights === 1 ? 'night' : 'nights'}`,
        amount: priceFormat.format(stayTotal),
      },
      { label: PRICE.cleaningFee, amount: priceFormat.format(cleaningFee) },
      { label: PRICE.serviceFee, amount: priceFormat.format(0) },
    ],
    total,
    taxes,
    due: total + taxes,
  }
}
