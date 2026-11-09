import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { CHECK_IN } from '../../data/copy'
import type { Stay } from '../../data/stays'
import { formatRange } from '../../lib/dates'
import { typeset } from '../../lib/typography'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useDismiss } from '../catalog/useDismiss'
import { DateRangeCalendar, type DateField } from '../search/DateRangeCalendar'
import { Popover } from '../search/Popover'
import { GuestSteppers, type Guests, type Range } from '../stay/BookingWidget'

type TripSummaryProps = {
  stay: Stay
  range: Range
  guests: Guests
  nights: number
  selecting: DateField
  onSelectingChange: (field: DateField) => void
  onPickDate: (iso: string) => DateField | null
  onClearDates: () => void
  onGuestsChange: (patch: Partial<Guests>) => void
  isUnavailable: (iso: string) => boolean
  legend: ReactNode
  arrival: string
  onArrivalChange: (time: string) => void
}

type Panel = 'dates' | 'guests' | 'arrival'

const ARRIVALS = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

export const guestsLabel = ({ adults, children, pets }: Guests) =>
  [
    `${adults} ${adults === 1 ? 'adult' : 'adults'}`,
    children ? `${children} ${children === 1 ? 'child' : 'children'}` : '',
    pets ? 'pet' : '',
  ]
    .filter(Boolean)
    .join(' · ')

/**
 * "Your trip": dates, guests and check-in, each with an Edit. Dates and guests
 * open the stay page's own calendar and steppers in a popover, so the summary
 * and the total follow every change; check-in picks an arrival time from a
 * list. All three open the same way: a popover under their row.
 */
export function TripSummary(props: TripSummaryProps) {
  const { stay, range, guests, nights, selecting, onSelectingChange, onPickDate, arrival, onArrivalChange } = props
  const [open, setOpen] = useState<Panel | null>(null)
  const [fromKeyboard, setFromKeyboard] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const isMd = useMediaQuery('(min-width: 768px)')
  const uid = useId()

  useDismiss(root, open !== null, (reason) => {
    setOpen(null)
    if (reason === 'escape') trigger.current?.focus()
  })

  const show = (panel: Panel, e: MouseEvent<HTMLButtonElement>) => {
    trigger.current = e.currentTarget
    setFromKeyboard(e.detail === 0)
    if (panel === 'dates') onSelectingChange('checkIn')
    setOpen((current) => (current === panel ? null : panel))
  }

  // The calendar stays open on a complete range; it closes when Guests is opened, on Esc or an outside click
  const pick = (iso: string) => {
    onPickDate(iso)
  }

  return (
    <div ref={root} className="flex flex-col">
      <Row
        label="Dates"
        value={
          nights
            ? typeset(`${formatRange(range.checkIn, range.checkOut)} ${range.checkOut.slice(0, 4)} · ${nights} ${nights === 1 ? 'night' : 'nights'}`)
            : range.checkIn
              ? 'Pick a checkout date'
              : 'Pick your dates'
        }
        action={<EditButton expanded={open === 'dates'} controls={`${uid}-dates`} onClick={(e) => show('dates', e)} what="dates" />}
      >
        {/* Right under its Edit, like Guests and Check-in. At lg the form column is narrower than the
            704px calendar, so there it hangs to the right (over the summary) instead of off the screen */}
        <Popover open={open === 'dates'} id={`${uid}-dates`} label="Change dates" direction="down" placement="inset-x-0 md:left-auto lg:left-0 lg:right-auto xl:left-auto xl:right-0" className="p-5 md:w-[44rem] md:p-8">
          <DateRangeCalendar
            checkIn={range.checkIn}
            checkOut={range.checkOut}
            selecting={selecting}
            onPick={pick}
            onClear={props.onClearDates}
            months={isMd ? 2 : 1}
            autoFocus={fromKeyboard}
            isUnavailable={props.isUnavailable}
            legend={props.legend}
          />
        </Popover>
      </Row>

      <Row
        label="Guests"
        value={guestsLabel(guests)}
        action={<EditButton expanded={open === 'guests'} controls={`${uid}-guests`} onClick={(e) => show('guests', e)} what="guests" />}
      >
        <Popover open={open === 'guests'} id={`${uid}-guests`} label="Change guests" direction="down" placement="inset-x-0 md:left-auto md:w-[26rem]" className="px-6 pt-1 pb-5">
          <GuestSteppers stay={stay} guests={guests} onChange={props.onGuestsChange} autoFocus={fromKeyboard} required />
        </Popover>
      </Row>

      <Row
        label="Check-in"
        value={arrival ? `Arriving around ${arrival} · door code sent 48 hours before` : CHECK_IN.short}
        action={<EditButton expanded={open === 'arrival'} controls={`${uid}-arrival`} onClick={(e) => show('arrival', e)} what="arrival time" />}
      >
        <Popover open={open === 'arrival'} id={`${uid}-arrival`} label="Arrival time" direction="down" placement="inset-x-0 md:left-auto md:w-[26rem]" className="px-6 pt-5 pb-5">
          <ArrivalPicker
            value={arrival}
            autoFocus={fromKeyboard}
            onPick={(time) => {
              onArrivalChange(time)
              setOpen(null)
              trigger.current?.focus()
            }}
          />
        </Popover>
      </Row>
    </div>
  )
}

function Row({ label, value, action, children }: { label: string; value: string; action: ReactNode; children?: ReactNode }) {
  return (
    <div className="relative border-b border-line py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-body tracking-[-0.01em]">{label}</span>
          <span className="text-body text-graphite-600 tabular-nums">{value}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function EditButton({
  expanded,
  controls,
  onClick,
  what,
  label = 'Edit',
}: {
  expanded: boolean
  controls: string
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  what: string
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      className="group relative mt-0.5 shrink-0 text-body text-ink"
    >
      {label}
      <span className="sr-only"> {what}</span>
      <span
        aria-hidden
        className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-500 ease-cinematic group-hover:scale-x-100 group-focus-visible:scale-x-100 ${
          expanded ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </button>
  )
}

/** The arrival times as a list of choices; the current one carries a tick. */
function ArrivalPicker({ value, autoFocus, onPick }: { value: string; autoFocus: boolean; onPick: (time: string) => void }) {
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus) list.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
  }, [autoFocus])

  const options = [{ value: '', label: 'Not sure yet' }, ...ARRIVALS.map((t) => ({ value: t, label: `Around ${t}` }))]
  return (
    <div className="flex flex-col">
      <span className="font-mono text-label tracking-label text-graphite-600 uppercase">Arriving around</span>
      <div ref={list} role="radiogroup" aria-label="Arrival time" className="mt-3 flex flex-col">
        {options.map((option) => {
          const checked = option.value === value
          return (
            <button
              key={option.value || 'unsure'}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onPick(option.value)}
              className={`flex items-center justify-between gap-4 border-b border-line py-3 text-left text-body tabular-nums transition-colors duration-500 ease-cinematic last:border-b-0 hover:text-ink focus-visible:outline-offset-2 ${
                checked ? 'text-ink' : 'text-graphite-600'
              }`}
            >
              {option.label}
              {checked && <Check size={16} strokeWidth={1.5} aria-hidden className="text-accent" />}
            </button>
          )
        })}
      </div>
      <p className="mt-4 border-t border-line pt-4 font-mono text-label text-graphite-600">The host sees this with your message</p>
    </div>
  )
}
