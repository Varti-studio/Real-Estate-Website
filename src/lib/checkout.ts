import { addDays, formatShortDate } from './dates'

/**
 * Checkout rules, pure (no React): the cancellation timeline, the split
 * payment, card formatting and the form's validation.
 */

export type CheckoutMode = 'guest' | 'profile'
export type PayPlan = 'full' | 'split'
export type PayMethod = 'card' | 'paypal' | 'applepay' | 'klarna'

/* ─── Cancellation (data/copy.ts CANCELLATION, with dates) ──────────────── */

/** Free cancellation lasts this long after booking. */
const FREE_DAYS = 2
/** No refund in the final days before check-in. */
const NO_REFUND_DAYS = 7

/** The last day of each refund step for a booking made on `booked`. `half` is null when the free window runs into the final week. */
export function cancellationTimeline(checkIn: string, booked: string) {
  const freeUntil = [addDays(booked, FREE_DAYS), checkIn].sort()[0]
  const halfUntil = addDays(checkIn, -NO_REFUND_DAYS)
  return { freeUntil, halfUntil: halfUntil > freeUntil ? halfUntil : null }
}

/** "Free cancellation until 8 Oct" — the summary card's info line. */
export const freeCancellationLine = (checkIn: string, booked: string) =>
  `Free cancellation until ${formatShortDate(cancellationTimeline(checkIn, booked).freeUntil)}`

/** The policy as dated sentences. */
export function cancellationSentence(checkIn: string, booked: string) {
  const { freeUntil, halfUntil } = cancellationTimeline(checkIn, booked)
  const free = `Free cancellation until ${formatShortDate(freeUntil)}, 48 hours after booking.`
  return halfUntil
    ? `${free} After that, cancel before ${formatShortDate(halfUntil)} for a 50% refund. There is no refund in the final ${NO_REFUND_DAYS} days.`
    : `${free} After that there is no refund, as check-in is less than ${NO_REFUND_DAYS} days away.`
}

export type CancellationStage = 'free' | 'half' | 'none'

/**
 * The refund steps of a made booking, each with the dates it covers, and
 * the one that applies `today`. The free step lasts through `freeUntil`, the
 * 50% step until the day before `halfUntil`.
 */
export function cancellationStatus(checkIn: string, booked: string, today: string) {
  const { freeUntil, halfUntil } = cancellationTimeline(checkIn, booked)
  const stage: CancellationStage = today <= freeUntil && today < checkIn ? 'free' : halfUntil && today < halfUntil ? 'half' : 'none'
  const noneFrom = halfUntil ?? addDays(freeUntil, 1)
  const steps: { stage: CancellationStage; when: string; refund: string }[] = [
    { stage: 'free', when: `Until ${formatShortDate(freeUntil)}`, refund: 'Full refund' },
    ...(halfUntil ? [{ stage: 'half' as const, when: `Until ${formatShortDate(addDays(halfUntil, -1))}`, refund: '50% refund' }] : []),
    { stage: 'none', when: `From ${formatShortDate(noneFrom)}`, refund: 'No refund' },
  ]
  const sentence =
    stage === 'free'
      ? `You can cancel for a full refund until ${formatShortDate(freeUntil)}.`
      : stage === 'half'
        ? `Cancel before ${formatShortDate(halfUntil!)} and you get 50% back.`
        : today < checkIn
          ? `Check-in is less than ${NO_REFUND_DAYS} days away, so a cancellation now is not refunded.`
          : 'This stay has begun, so it can no longer be cancelled.'
  return { stage, steps, sentence }
}

/* ─── Split payment ─────────────────────────────────────────────────────── */

/** A split needs check-in further away than this, so the second charge lands after the free window. */
export const SPLIT_MIN_DAYS = FREE_DAYS + NO_REFUND_DAYS

/**
 * Half now (rounded up), the rest charged automatically when the 50% refund
 * ends, 7 days before check-in. Null when that date falls inside the free window.
 */
export function splitPlan(due: number, checkIn: string, booked: string) {
  const dueISO = addDays(checkIn, -NO_REFUND_DAYS)
  if (dueISO <= cancellationTimeline(checkIn, booked).freeUntil) return null
  const now = Math.ceil(due / 2)
  return { now, later: due - now, dueISO }
}

/* ─── Cards ─────────────────────────────────────────────────────────────── */

export type CardBrand = 'visa' | 'mastercard' | 'amex'

export const CARD_LABELS: Record<CardBrand, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex' }

const digitsOf = (s: string) => s.replace(/\D/g, '')

export function detectCard(value: string): CardBrand | null {
  const d = digitsOf(value)
  if (/^4/.test(d)) return 'visa'
  if (/^3[47]/.test(d)) return 'amex'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'mastercard'
  return null
}

/** Lengths a number may have: Amex 15, Mastercard 16, Visa 13 / 16 / 19, anything else 12–19. */
const CARD_LENGTHS: Record<CardBrand, number[]> = { amex: [15], mastercard: [16], visa: [13, 16, 19] }
const MAX_DIGITS = 19

const maxDigits = (brand: CardBrand | null) => (brand ? Math.max(...CARD_LENGTHS[brand]) : MAX_DIGITS)

/** The code's length: 4 on the front of an Amex, 3 on the back of the others; either for a card we don't recognise. */
export const cvvLengths = (brand: CardBrand | null) => (brand === 'amex' ? [4] : brand ? [3] : [3, 4])

/** "4242424242424242" → "4242 4242 4242 4242"; Amex groups 4-6-5, the rest in fours (up to 19 digits). */
export function formatCardNumber(value: string) {
  const brand = detectCard(value)
  const d = digitsOf(value).slice(0, maxDigits(brand))
  if (brand !== 'amex') return d.replace(/(\d{4})(?=\d)/g, '$1 ')
  return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(' ')
}

/**
 * "0929" → "09 / 29". A first digit above 1 is a month on its own ("9" → "09"),
 * "1/" pads to "01", and a full year ("12/2029", typed or autofilled) keeps its last two digits.
 */
export function formatExpiry(value: string) {
  const [month = '', year] = value.split('/').map(digitsOf)
  let d = digitsOf(value)
  if (year !== undefined && month.length === 1) d = `0${month}${year}`
  else if (year !== undefined && month.length === 2 && year.length === 4) d = `${month}${year.slice(2)}`
  // A year typed in full ("12 / 202…"): "20" can't be a valid two-digit year, so it starts a four-digit one
  else if (d.length >= 5 && d.slice(2, 4) === '20') d = d.slice(0, 2) + d.slice(4)
  if (/^[2-9]/.test(d)) d = `0${d}`
  d = d.slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
}

/** "MM / YY", not before this month. */
function expiryProblem(value: string, today: string) {
  const match = /^(\d{2}) \/ (\d{2})$/.exec(value)
  if (!match) return 'Enter the expiry as MM / YY'
  const month = Number(match[1])
  if (month < 1 || month > 12) return 'Check the month'
  const expiry = `20${match[2]}-${match[1]}`
  return expiry < today.slice(0, 7) ? 'This card has expired' : ''
}

/* ─── Form ──────────────────────────────────────────────────────────────── */

export interface CheckoutForm {
  name: string
  email: string
  signInEmail: string
  cardNumber: string
  expiry: string
  cvv: string
  postal: string
  country: string
  saveCard: boolean
  message: string
  phoneCode: string
  phone: string
  arrival: string
}

export type FieldName = keyof CheckoutForm | 'account'

export const EMPTY_FORM: CheckoutForm = {
  name: '',
  email: '',
  signInEmail: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  postal: '',
  country: 'Norway',
  saveCard: false,
  message: '',
  phoneCode: '+47',
  phone: '',
  arrival: '',
}

/** Top-to-bottom, so the first problem is the first one on screen. */
export const FIELD_ORDER: FieldName[] = ['account', 'name', 'email', 'cardNumber', 'expiry', 'cvv', 'postal', 'message', 'phone']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Every problem in the form, by field. An empty object means it can be sent. */
export function validate(
  form: CheckoutForm,
  { mode, method, host, today }: { mode: CheckoutMode; method: PayMethod; host: string; today: string },
) {
  const errors: Partial<Record<FieldName, string>> = {}

  if (mode === 'profile') errors.account = 'Accounts open soon. Continue as a guest for now.'
  else {
    if (form.name.trim().length < 2) errors.name = 'Enter your full name'
    if (!EMAIL.test(form.email.trim())) errors.email = 'Enter an email like name@example.com'
  }

  if (method === 'card') {
    const brand = detectCard(form.cardNumber)
    const digits = digitsOf(form.cardNumber)
    const lengthOk = brand ? CARD_LENGTHS[brand].includes(digits.length) : digits.length >= 12
    if (!digits) errors.cardNumber = 'Enter your card number'
    // Length only, no checksum: a prototype with no payment backend must take any number
    else if (!lengthOk) errors.cardNumber = 'The card number looks too short'
    const expiry = expiryProblem(form.expiry, today)
    if (expiry) errors.expiry = expiry
    if (!cvvLengths(brand).includes(digitsOf(form.cvv).length))
      errors.cvv = brand === 'amex' ? 'Enter the 4 digits on the front' : brand ? 'Enter the 3 digits on the back' : 'Enter the 3 or 4 digit code'
    if (!form.postal.trim()) errors.postal = 'Enter your postal code'
  }

  if (form.message.trim().length < 10) errors.message = `Write a line or two for ${host}`
  if (digitsOf(form.phone).length < 6) errors.phone = 'Enter a number for the door code'

  return errors
}
