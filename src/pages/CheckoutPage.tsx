import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Lock } from 'lucide-react'
import { CHECKOUT } from '../data/copy'
import type { Stay } from '../data/stays'
import { bookingUrl, newReference, saveBooking } from '../lib/booking'
import {
  detectCard,
  EMPTY_FORM,
  FIELD_ORDER,
  splitPlan,
  validate,
  type CheckoutForm,
  type CheckoutMode,
  type FieldName,
  type PayMethod as Method,
  type PayPlan,
} from '../lib/checkout'
import { todayISO } from '../lib/dates'
import { priceFormat } from '../lib/format'
import { DURATION, STAGGER, fadeUp, lineReveal, staggerContainer, transition } from '../lib/motion'
import { Link, linkClick, navigate, useLocation } from '../lib/router'
import { checkoutUrl, stayFromPath, stayParamsFromSearch, stayUrl, storyFor, type Story } from '../lib/stay'
import { NBSP } from '../lib/typography'
import { CheckoutSection } from '../components/checkout/CheckoutSection'
import { CheckoutSteps } from '../components/checkout/CheckoutSteps'
import { ModeTabs } from '../components/checkout/ModeTabs'
import { PayChoice } from '../components/checkout/PayChoice'
import { PayMethod } from '../components/checkout/PayMethod'
import { CancellationTerms, GroundRules } from '../components/checkout/Policies'
import { SummaryCard } from '../components/checkout/SummaryCard'
import { TripRequirements } from '../components/checkout/TripRequirements'
import { TripSummary } from '../components/checkout/TripSummary'
import { bookingState, Rolling } from '../components/stay/BookingWidget'
import { accent } from '../components/stay/text'
import { useStayBooking } from '../components/stay/useStayBooking'
import { Button } from '../components/ui/Button'
import { MonoLabel } from '../components/ui/MonoLabel'

/** /stays/<id>/checkout — confirm and pay. Arrives from Reserve with a bookable range. */
export function CheckoutPage() {
  const { pathname } = useLocation()
  const stay = stayFromPath(pathname)
  return stay ? <CheckoutGate key={stay.id} stay={stay} /> : <CheckoutFallback />
}

/** A checkout needs a bookable range and at least one guest in its link; without them, send the visitor back. */
function CheckoutGate({ stay }: { stay: Stay }) {
  const story = useMemo(() => storyFor(stay), [stay])
  const [ready] = useState(() => {
    const params = stayParamsFromSearch(new URLSearchParams(window.location.search))
    return bookingState(stay, story, params).status === 'ok' && params.adults + params.children > 0
  })
  return ready ? <CheckoutView stay={stay} story={story} /> : <CheckoutFallback stay={stay} />
}

const ISSUES: Record<'empty' | 'short' | 'taken', (minNights: number) => string> = {
  empty: () => 'Pick your dates to continue.',
  short: (n) => `Minimum stay ${n}${NBSP}nights. Change your dates to continue.`,
  taken: () => 'These dates overlap a booking. Pick others to continue.',
}

function CheckoutView({ stay, story }: { stay: Stay; story: Story }) {
  const booking = useStayBooking(stay, story, checkoutUrl)
  const { range, guests } = booking
  const reduced = useReducedMotion()
  const [today] = useState(todayISO)

  const [mode, setMode] = useState<CheckoutMode>('guest')
  const [plan, setPlan] = useState<PayPlan>('full')
  const [method, setMethod] = useState<Method>('card')
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM)
  const [touched, setTouched] = useState<Set<FieldName>>(() => new Set())
  const [submitted, setSubmitted] = useState(false)

  const host = story.host.name
  const state = bookingState(stay, story, range)
  const quote = state.status === 'ok' ? state.quote : null
  const split = quote ? splitPlan(quote.due, range.checkIn, today) : null
  // A split that no longer fits the dates falls back to paying in full
  const activePlan: PayPlan = plan === 'split' && split ? 'split' : 'full'
  const dueNow = quote ? (activePlan === 'split' && split ? split.now : quote.due) : 0

  const allErrors = validate(form, { mode, method, host, today })
  const errors = Object.fromEntries(
    Object.entries(allErrors).filter(([name]) => submitted || touched.has(name as FieldName)),
  ) as typeof allErrors
  const problems = FIELD_ORDER.filter((name) => allErrors[name])

  const backTo = stayUrl(stay.id, { ...range, ...guests })

  useEffect(() => {
    document.title = 'Confirm and pay — Solum'
  }, [])

  const onChange = <K extends keyof CheckoutForm>(name: K, value: CheckoutForm[K]) => setForm((f) => ({ ...f, [name]: value }))
  const onBlur = (name: FieldName) => setTouched((t) => (t.has(name) ? t : new Set(t).add(name)))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (state.status !== 'ok') return
    const first = problems[0]
    if (first) {
      const el = document.getElementById(`checkout-${first}`)
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
      el?.focus({ preventScroll: true })
      return
    }
    // No payment backend: keep the booking in this tab and show its confirmation.
    // `replace`, so Back leads to the stay page rather than a filled-in form.
    const ref = newReference()
    const digits = form.cardNumber.replace(/\D/g, '')
    saveBooking({
      ref,
      stayId: stay.id,
      ...range,
      ...guests,
      guest: { firstName: form.name.trim().split(/\s+/)[0], email: form.email.trim() },
      bookedOn: today,
      plan: activePlan,
      method,
      card: method === 'card' ? { brand: detectCard(digits), last4: digits.slice(-4) } : undefined,
      arrival: form.arrival || undefined,
    })
    navigate(bookingUrl(ref), { replace: true })
    window.scrollTo({ top: 0 })
  }

  return (
    <main className="container-x pb-24 lg:pb-32">
      <motion.header variants={staggerContainer(STAGGER.base, 0.1)} initial="hidden" animate="visible" className="pt-8 lg:pt-10">
        <motion.div variants={fadeUp}>
          <Link
            to={backTo}
            className="group inline-flex items-center gap-2 text-body text-graphite-600 transition-colors duration-500 ease-cinematic hover:text-ink"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
              aria-hidden
              className="transition-transform duration-500 ease-cinematic group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
            />
            Back to {stay.name}
          </Link>
        </motion.div>
        <h1 aria-label="Confirm and pay" className="mt-8 text-h2 font-light lg:mt-10">
          <span aria-hidden className="block overflow-hidden pb-[0.12em]">
            <motion.span variants={lineReveal} className="block">
              Confirm and{NBSP}{accent('pay')}
            </motion.span>
          </span>
        </h1>
        <motion.div variants={fadeUp} className="mt-8">
          <CheckoutSteps current={1} backTo={backTo} lastLabel={stay.instantBook ? 'Booked' : 'Requested'} />
        </motion.div>
      </motion.header>

      <div className="mt-10 grid gap-x-10 lg:mt-14 lg:grid-cols-12">
        <motion.aside
          aria-label="Your booking"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 lg:col-start-9 lg:row-start-1"
        >
          <div className="lg:sticky lg:top-8">
            <SummaryCard
              stay={stay}
              story={story}
              range={range}
              guests={guests}
              quote={quote}
              plan={activePlan}
              split={split}
              booked={today}
            />
          </div>
        </motion.aside>

        <div className="mt-10 min-w-0 lg:col-span-7 lg:row-start-1 lg:mt-0">
          <form noValidate onSubmit={submit} aria-label="Checkout">
            <CheckoutSection id="details" title="Your details">
              <ModeTabs mode={mode} onModeChange={setMode} form={form} errors={errors} onChange={onChange} onBlur={onBlur} />
            </CheckoutSection>

            {/* Raised: its date and guest popovers open over the sections below */}
            <CheckoutSection id="trip" title="Your trip" raised>
              <TripSummary
                stay={stay}
                range={range}
                guests={guests}
                nights={booking.nights}
                selecting={booking.selecting}
                onSelectingChange={booking.setSelecting}
                onPickDate={booking.onPickDate}
                onClearDates={booking.onClearDates}
                onGuestsChange={booking.onGuestsChange}
                isUnavailable={booking.isUnavailable}
                legend={booking.legend}
                arrival={form.arrival}
                onArrivalChange={(t) => onChange('arrival', t)}
              />
            </CheckoutSection>

            <CheckoutSection id="plan" title="Choose how to pay">
              <PayChoice plan={activePlan} onChange={setPlan} due={quote?.due ?? 0} split={split} instant={stay.instantBook} host={host} />
            </CheckoutSection>

            <CheckoutSection id="method" title="Pay with">
              <PayMethod method={method} onMethodChange={setMethod} form={form} errors={errors} onChange={onChange} onBlur={onBlur} />
            </CheckoutSection>

            <CheckoutSection id="required" title="Required for your trip">
              <TripRequirements host={host} form={form} errors={errors} onChange={onChange} onBlur={onBlur} />
            </CheckoutSection>

            <CheckoutSection id="cancellation" title="Cancellation policy">
              {range.checkIn ? (
                <CancellationTerms checkIn={range.checkIn} booked={today} />
              ) : (
                <p className="text-body text-graphite-600">Pick your dates to see the dates that apply.</p>
              )}
            </CheckoutSection>

            <CheckoutSection id="ground-rules" title="Ground rules" intro="Every guest agrees to three things.">
              <GroundRules />
            </CheckoutSection>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col items-start gap-5 border-t border-line pt-10 lg:pt-12"
            >
              <p className="max-w-xl text-body leading-[1.55] text-graphite-600">{CHECKOUT.agreement(host)}</p>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                transition={transition(DURATION.micro)}
                aria-disabled={state.status !== 'ok'}
                className={`group flex h-13 w-full items-center justify-center gap-3 rounded-full px-8 text-body tracking-[-0.01em] text-milk transition-colors duration-500 ease-cinematic sm:w-auto ${
                  state.status === 'ok' ? 'bg-accent hover:bg-accent-hover' : 'cursor-not-allowed bg-stone-500'
                }`}
              >
                <Lock size={16} strokeWidth={1.5} aria-hidden />
                {stay.instantBook ? (
                  <span className="flex items-baseline gap-1.5 tabular-nums">
                    Confirm and pay <Rolling value={priceFormat.format(dueNow)} />
                  </span>
                ) : (
                  'Request to book'
                )}
              </motion.button>
              <p aria-live="polite" className="min-h-4 font-mono text-label text-graphite-600">
                {state.status !== 'ok'
                  ? ISSUES[state.status](story.minNights)
                  : submitted && problems.length
                    ? `${problems.length} ${problems.length === 1 ? 'field needs' : 'fields need'} attention above.`
                    : stay.instantBook
                      ? ''
                      : `You won’t be charged until ${host} accepts.`}
              </p>
            </motion.div>
          </form>
        </div>
      </div>
    </main>
  )
}

/** Unknown stay, or a checkout link without bookable dates. */
function CheckoutFallback({ stay }: { stay?: Stay }) {
  useEffect(() => {
    document.title = `${stay ? 'Pick your dates and guests' : 'Stay not found'} — Solum`
  }, [stay])

  // Back to the stay with whatever the link already had, so nothing chosen is lost
  const to = stay ? stayUrl(stay.id, stayParamsFromSearch(new URLSearchParams(window.location.search))) : '/search'
  return (
    <main className="container-x pb-24 lg:pb-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10 flex flex-col items-start gap-8 border-y border-line py-16 lg:mt-16 lg:py-24"
      >
        <MonoLabel className="text-graphite-600">{stay ? '(—) Pick your dates and guests first' : '(—) Stay not found'}</MonoLabel>
        <p className="max-w-2xl text-h2 font-light">
          {stay ? (
            <>
              Choose your dates and guests on the stay page, then come back to{NBSP}{accent('pay')}.
            </>
          ) : (
            <>
              We can’t find this {accent('stay')}. It may have left the{NBSP}catalogue.
            </>
          )}
        </p>
        <Button href={to} onClick={(e) => linkClick(e, to)}>
          {stay ? `Back to ${stay.name}` : 'Browse all stays'}
        </Button>
      </motion.div>
    </main>
  )
}
