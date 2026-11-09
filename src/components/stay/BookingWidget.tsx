import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, PawPrint, Star } from 'lucide-react'
import type { Stay } from '../../data/stays'
import { rangeAvailable } from '../../lib/availability'
import { formatRange, formatShortDate, nightsBetween } from '../../lib/dates'
import { priceFormat } from '../../lib/format'
import { DURATION, transition } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import { quote } from '../../lib/pricing'
import { navigate } from '../../lib/router'
import { checkoutUrl, type StayParams, type Story } from '../../lib/stay'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useDismiss } from '../catalog/useDismiss'
import { DateRangeCalendar, type DateField } from '../search/DateRangeCalendar'
import { StepperRow, Switch } from '../search/GuestsPanel'
import { Popover } from '../search/Popover'
import { EMAIL } from '../../data/copy'
import { HostAvatar } from './HostAvatar'
import { MessageHost } from './MessageHost'

export type Range = Pick<StayParams, 'checkIn' | 'checkOut'>
export type Guests = Pick<StayParams, 'adults' | 'children' | 'pets'>

type BookingWidgetProps = {
  stay: Stay
  story: Story
  range: Range
  guests: Guests
  selecting: DateField
  onSelectingChange: (field: DateField) => void
  /** Returns the field to pick next, `null` once the range is complete. */
  onPickDate: (iso: string) => DateField | null
  onClearDates: () => void
  onGuestsChange: (patch: Partial<Guests>) => void
  isUnavailable: (iso: string) => boolean
  legend: ReactNode
}

/** Where a range stands: no dates yet, dates that can't be booked, or a quote. */
export function bookingState(stay: Stay, story: Story, range: Range) {
  const nights = nightsBetween(range.checkIn, range.checkOut)
  if (!nights) return { status: 'empty' as const, nights }
  if (nights < story.minNights) return { status: 'short' as const, nights }
  if (!rangeAvailable(stay, range.checkIn, range.checkOut)) return { status: 'taken' as const, nights }
  return { status: 'ok' as const, nights, quote: quote(stay, story, nights) }
}

/**
 * The booking panel: price, dates and guests, Reserve, and the cost breakdown.
 * Dates and guests are shared with the page (the availability calendar edits
 * the same range), so the total follows every pick.
 */
export function BookingWidget({
  stay,
  story,
  range,
  guests,
  selecting,
  onSelectingChange,
  onPickDate,
  onClearDates,
  onGuestsChange,
  isUnavailable,
  legend,
}: BookingWidgetProps) {
  const [open, setOpen] = useState<'dates' | 'guests' | null>(null)
  const [fromKeyboard, setFromKeyboard] = useState(false)
  const [messaging, setMessaging] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const isMd = useMediaQuery('(min-width: 768px)')
  const uid = useId()
  const state = bookingState(stay, story, range)
  const total = guests.adults + guests.children
  const hostName = story.host.name === 'Your host' ? 'the host' : story.host.name
  // Dates price the stay; guests are still needed before checkout
  const ready = state.status === 'ok' && total > 0

  useDismiss(root, open !== null, (reason) => {
    setOpen(null)
    if (reason === 'escape') trigger.current?.focus()
  })

  const show = (panel: 'dates' | 'guests', e: MouseEvent<HTMLButtonElement>, field?: DateField) => {
    trigger.current = e.currentTarget
    setFromKeyboard(e.detail === 0)
    if (field) onSelectingChange(field)
    setOpen((current) => (current === panel && (!field || field === selecting) ? null : panel))
  }

  // The calendar stays open on a complete range; it closes when Guests is opened, on Esc or an outside click
  const pick = (iso: string) => {
    onPickDate(iso)
  }

  const reserve = (e: MouseEvent<HTMLButtonElement>) => {
    if (ready) return navigate(checkoutUrl(stay.id, { ...range, ...guests }))
    if (state.status === 'ok') return show('guests', e)
    show('dates', e, range.checkIn && state.status === 'empty' ? 'checkOut' : 'checkIn')
  }

  return (
    <div className="rounded-frame border border-line bg-milk p-6 lg:p-7">
      {/* Price */}
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-baseline gap-2 leading-[1.55]">
          <span className="text-h3 font-light tracking-[-0.03em] tabular-nums">{priceFormat.format(stay.pricePerNight)}</span>
          <span className="text-body text-graphite-600">{`/${NBSP}night`}</span>
        </p>
        <span className="inline-flex h-7 items-center gap-1 rounded-full border border-line px-3 font-mono text-label tabular-nums">
          <Star size={12} strokeWidth={1.5} className="fill-ink" aria-hidden />
          {stay.rating.toFixed(1)}
          <span className="sr-only"> out of 10</span>
        </span>
      </div>

      {/* Dates + guests */}
      <div ref={root} className="relative mt-6">
        <div className="rounded-card border border-line">
          <div className="grid grid-cols-2 border-b border-line">
            <Field
              label="Check-in"
              value={range.checkIn ? formatShortDate(range.checkIn) : 'Add date'}
              empty={!range.checkIn}
              active={open === 'dates' && selecting === 'checkIn'}
              controls={`${uid}-dates`}
              onClick={(e) => show('dates', e, 'checkIn')}
              className="rounded-tl-card"
            />
            <Field
              label="Checkout"
              value={range.checkOut ? formatShortDate(range.checkOut) : 'Add date'}
              empty={!range.checkOut}
              active={open === 'dates' && selecting === 'checkOut'}
              controls={`${uid}-dates`}
              onClick={(e) => show('dates', e, range.checkIn ? 'checkOut' : 'checkIn')}
              className="rounded-tr-card border-l border-line"
            />
          </div>
          <Field
            label="Guests"
            value={total ? `${total}${NBSP}${total === 1 ? 'guest' : 'guests'}${guests.pets ? ' · pet' : ''}` : 'Add guests'}
            empty={!total}
            active={open === 'guests'}
            controls={`${uid}-guests`}
            onClick={(e) => show('guests', e)}
            className="rounded-b-card"
            chevron
          />
        </div>

        <Popover
          open={open === 'dates'}
          id={`${uid}-dates`}
          label="Choose dates"
          direction="down"
          // Below lg it spans the whole panel; beside the page it opens leftwards over the story
          placement="-inset-x-6 lg:left-auto lg:right-0"
          className="p-5 md:p-8 lg:w-[44rem]"
        >
          <DateRangeCalendar
            checkIn={range.checkIn}
            checkOut={range.checkOut}
            selecting={selecting}
            onPick={pick}
            onClear={onClearDates}
            months={isMd ? 2 : 1}
            autoFocus={fromKeyboard}
            isUnavailable={isUnavailable}
            legend={legend}
          />
        </Popover>

        <Popover
          open={open === 'guests'}
          id={`${uid}-guests`}
          label="Choose guests"
          direction="down"
          placement="inset-x-0"
          className="px-6 pt-1 pb-5"
        >
          <GuestSteppers stay={stay} guests={guests} onChange={onGuestsChange} autoFocus={fromKeyboard} />
        </Popover>
      </div>

      {/* Reserve */}
      <motion.button
        type="button"
        onClick={reserve}
        whileTap={{ scale: 0.98 }}
        transition={transition(DURATION.micro)}
        className="group mt-4 flex h-13 w-full items-center justify-center gap-3 rounded-full bg-accent text-body tracking-[-0.01em] text-milk transition-colors duration-500 ease-cinematic hover:bg-accent-hover"
      >
        {ready ? 'Reserve stay' : state.status === 'ok' ? 'Add guests' : 'Check availability'}
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-0.5 group-focus-visible:translate-x-1"
        />
      </motion.button>

      <div aria-live="polite" className="mt-3 text-center font-mono text-label text-graphite-600">
        {state.status === 'taken'
            ? 'These dates overlap a booking. Pick others.'
            : state.status === 'ok' && !total
              ? 'Add guests to continue'
            : state.status === 'short'
              ? `Minimum stay ${story.minNights}${NBSP}nights`
              : "You won't be charged yet"}
      </div>

      {/* Breakdown */}
      {state.status === 'ok' ? (
        <dl className="mt-6 border-t border-line pt-5 font-mono text-label tabular-nums">
          {state.quote.lines.map((line) => (
            <div key={line.label} className="flex items-baseline justify-between gap-4 py-1.5">
              <dt className="text-graphite-600">
                <Rolling value={typeset(line.label)} />
              </dt>
              <dd className="flex flex-col items-end text-right">
                <Rolling value={line.amount} />
                {line.note && <span className="text-graphite-600">({line.note})</span>}
              </dd>
            </div>
          ))}
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-4 text-body">
            <dt className="font-sans tracking-[-0.01em]">Total before taxes</dt>
            <dd>
              <Rolling value={priceFormat.format(state.quote.total)} />
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-6 border-t border-line pt-5 font-mono text-label text-graphite-600">
          Add your dates to see the total for your stay.
        </p>
      )}

      {/* Message opens a window to the host; general questions come to us by email */}
      <div className="mt-6 border-t border-line">
        <div className="flex items-center gap-4 border-b border-line py-5">
          <HostAvatar name={story.host.name} photo={story.host.photo} className="size-14 text-title" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body tracking-[-0.01em]">{`Hosted by${NBSP}${hostName}`}</span>
            <span className="font-mono text-label text-graphite-600">{story.host.responds}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessaging(true)}
            aria-haspopup="dialog"
            aria-label={`Message ${hostName}`}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-ink px-4 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic hover:bg-ink hover:text-milk focus-visible:bg-ink focus-visible:text-milk"
          >
            Message
          </button>
        </div>
        <PanelLink href={`mailto:${EMAIL}?subject=${encodeURIComponent(stay.name)}`} label="Questions? Ask us" />
      </div>

      <MessageHost open={messaging} onClose={() => setMessaging(false)} stay={stay} story={story} trip={{ ...range, ...guests }} />
    </div>
  )
}

/** A row at the foot of the panel: a label with a growing underline, and ↗. */
function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="group flex items-center justify-between gap-4 border-b border-line py-4 text-body text-ink last:border-b-0 last:pb-0">
      <span className="flex flex-col gap-1">
        <span className="relative w-fit">
          {label}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-cinematic group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
        </span>
      </span>
      <ArrowUpRight
        size={16}
        strokeWidth={1.5}
        aria-hidden
        className="shrink-0 transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-0.5 group-focus-visible:translate-x-1"
      />
    </a>
  )
}

export function Field({
  label,
  value,
  empty = false,
  active,
  controls,
  onClick,
  chevron = false,
  className = '',
}: {
  label: string
  value: string
  empty?: boolean
  active: boolean
  controls: string
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  chevron?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-controls={controls}
      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-500 ease-cinematic focus-visible:outline-offset-[-4px] ${
        active ? 'bg-sand' : 'hover:bg-sand/60'
      } ${className}`}
    >
      <span className="flex flex-col gap-1">
        <span className="font-mono text-label tracking-label text-graphite-600 uppercase">{label}</span>
        <span className={`text-body tabular-nums ${empty ? 'text-graphite-600' : 'text-ink'}`}>{value}</span>
      </span>
      {chevron && (
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className={`transition-transform duration-500 ease-cinematic ${active ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  )
}

/** Adults and children up to the stay's capacity; pets only where welcome. */
export function GuestSteppers({
  stay,
  guests,
  onChange,
  autoFocus,
  required = false,
}: {
  stay: Stay
  guests: Guests
  onChange: (patch: Partial<Guests>) => void
  autoFocus: boolean
  /** At least one adult (checkout); otherwise the party may start empty, as on the stay page. */
  required?: boolean
}) {
  const first = useRef<HTMLDivElement>(null)
  const id = useId()
  const full = guests.adults + guests.children >= stay.guests

  useEffect(() => {
    if (autoFocus) first.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }, [autoFocus])

  return (
    <div ref={first} className="flex flex-col">
      <StepperRow
        label="Adults"
        unit="adult"
        hint="Ages 13 or above"
        value={guests.adults}
        // An adult must accompany children
        min={required || guests.children > 0 ? 1 : 0}
        canAdd={!full}
        onChange={(v) => onChange({ adults: v })}
      />
      <StepperRow
        label="Children"
        unit="child"
        hint="Ages 2 – 12"
        value={guests.children}
        min={0}
        canAdd={!full}
        onChange={(v) => onChange({ children: v, adults: v > 0 && guests.adults === 0 ? 1 : guests.adults })}
      />
      <div className="flex items-center justify-between gap-6 pt-5">
        <div className="flex items-start gap-3">
          <PawPrint size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink" aria-hidden />
          <div className="flex flex-col gap-1">
            <span id={`${id}-pets`} className="text-body tracking-[-0.01em]">
              Bringing a pet
            </span>
            <span id={`${id}-pets-hint`} className="text-body text-graphite-600">
              {stay.petFriendly ? 'Pets are welcome here' : "This stay doesn't allow pets"}
            </span>
          </div>
        </div>
        {stay.petFriendly && (
          <Switch checked={guests.pets} onChange={(v) => onChange({ pets: v })} labelledBy={`${id}-pets`} describedBy={`${id}-pets-hint`} />
        )}
      </div>
      <p className="mt-5 border-t border-line pt-4 font-mono text-label text-graphite-600">
        {typeset(`Up to ${stay.guests} guests · infants stay free`)}
      </p>
    </div>
  )
}

/** A value that rolls (fade + 4px) when it changes. */
export function Rolling({ value }: { value: string }) {
  return (
    <span className="relative inline-grid">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={transition(DURATION.micro)}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/**
 * Below `lg`: a bar fixed to the foot of the screen for the whole page,
 * footer included, stepping aside only while the inline booking panel is in
 * view. Portalled (so no ancestor transform traps `position: fixed`); while
 * mounted the body gets matching bottom padding, so the footer's last line
 * still scrolls clear of it.
 */
export function ReserveBar({
  stay,
  story,
  range,
  hidden,
  onReserve,
}: {
  stay: Stay
  story: Story
  range: Range
  hidden: boolean
  onReserve: () => void
}) {
  const state = bookingState(stay, story, range)

  useEffect(() => {
    const previous = document.body.style.paddingBottom
    document.body.style.paddingBottom = 'calc(5rem + env(safe-area-inset-bottom))'
    return () => {
      document.body.style.paddingBottom = previous
    }
  }, [])

  return createPortal(
    <motion.div
      initial={false}
      animate={{ y: hidden ? '100%' : '0%', opacity: hidden ? 0 : 1 }}
      transition={transition(DURATION.ui)}
      inert={hidden}
      aria-hidden={hidden}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-milk/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-body leading-[1.55] tabular-nums">
            {priceFormat.format(stay.pricePerNight)}{' '}
            <span className="text-body text-graphite-600">{`/${NBSP}night`}</span>
          </p>
          <p className="truncate font-mono text-label text-graphite-600 tabular-nums">
            {state.status === 'ok'
              ? `${formatRange(range.checkIn, range.checkOut)} · ${priceFormat.format(state.quote.total)} total`
              : `★ ${stay.rating.toFixed(1)} · ${stay.reviews} reviews`}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onReserve}
          whileTap={{ scale: 0.98 }}
          transition={transition(DURATION.micro)}
          className="flex h-12 shrink-0 items-center rounded-full bg-accent px-6 text-body text-milk transition-colors duration-500 ease-cinematic hover:bg-accent-hover"
        >
          {state.status === 'ok' ? 'Reserve' : 'Check dates'}
        </motion.button>
      </div>
    </motion.div>,
    document.body,
  )
}
