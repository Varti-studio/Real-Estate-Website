import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  WEEKDAYS,
  addDays,
  addMonths,
  formatLongDate,
  formatMonth,
  formatShortDate,
  monthGrid,
  monthOf,
  nightsBetween,
  shiftMonths,
  todayISO,
  weekEnd,
  weekStart,
} from '../../lib/dates'
import { DURATION, transition } from '../../lib/motion'

export type DateField = 'checkIn' | 'checkOut'
type Range = { checkIn: string; checkOut: string }

/**
 * Airbnb-style range picking. Returns the new range and which field to pick next
 * (`null` once the range is complete).
 */
export function pickDate(range: Range, selecting: DateField, iso: string): Range & { next: DateField | null } {
  if (selecting === 'checkIn' || !range.checkIn) {
    const keep = range.checkOut > iso ? range.checkOut : ''
    return { checkIn: iso, checkOut: keep, next: 'checkOut' }
  }
  if (iso <= range.checkIn) return { checkIn: iso, checkOut: '', next: 'checkOut' }
  return { checkIn: range.checkIn, checkOut: iso, next: null }
}

type DateRangeCalendarProps = Range & {
  selecting: DateField
  onPick: (iso: string) => void
  onClear: () => void
  months?: 1 | 2
  /** Move focus onto the grid when mounted (keyboard-opened popover). */
  autoFocus?: boolean
  /** Days that can't be picked beyond the past, e.g. a stay's booked nights. */
  isUnavailable?: (iso: string) => boolean
  /** Quiet note under the footer, e.g. how booked days are marked. */
  legend?: ReactNode
}

export function DateRangeCalendar({
  checkIn,
  checkOut,
  selecting,
  onPick,
  onClear,
  months = 2,
  autoFocus = false,
  isUnavailable,
  legend,
}: DateRangeCalendarProps) {
  const today = todayISO()
  const [view, setView] = useState(() => monthOf(checkIn || today))
  const [focused, setFocused] = useState(() => checkIn || today)
  const [hovered, setHovered] = useState('')
  const [direction, setDirection] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const moveFocus = useRef(autoFocus)

  const visible = Array.from({ length: months }, (_, i) => addMonths(view, i))
  const lastVisibleDay = addDays(addMonths(view, months), -1)
  const canGoBack = view > monthOf(today)

  // Keep keyboard focus on the roving day button
  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    root.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus()
  }, [focused, view])

  const showMonth = (next: string, dir: number) => {
    setDirection(dir)
    setView(next)
  }

  const page = (dir: 1 | -1) => {
    const next = addMonths(view, dir)
    if (dir < 0 && next < monthOf(today)) return
    showMonth(next, dir)
    // Keep a tabbable day inside the new view
    const first = next < today && monthOf(today) === next ? today : next
    setFocused(first)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => weekStart(focused),
      End: () => weekEnd(focused),
      PageUp: () => shiftMonths(focused, -1),
      PageDown: () => shiftMonths(focused, 1),
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    let next = move()
    if (next < today) next = today
    moveFocus.current = true
    setFocused(next)
    if (next < view) showMonth(monthOf(next), -1)
    else if (next > lastVisibleDay) showMonth(addMonths(monthOf(next), -(months - 1)), 1)
  }

  // Range to paint: the committed range, or a live preview while choosing check-out
  const previewEnd = checkIn && !checkOut && selecting === 'checkOut' && hovered > checkIn ? hovered : ''
  const rangeEnd = checkOut || previewEnd
  const nights = nightsBetween(checkIn, checkOut)

  return (
    <div ref={root} onKeyDown={onKeyDown} onPointerLeave={() => setHovered('')}>
      {/* Month navigation */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 flex justify-between">
          <NavButton label="Previous month" disabled={!canGoBack} onClick={() => page(-1)}>
            <ChevronLeft size={16} strokeWidth={1.5} />
          </NavButton>
          <NavButton label="Next month" onClick={() => page(1)}>
            <ChevronRight size={16} strokeWidth={1.5} />
          </NavButton>
        </div>

        {/* Clip only horizontally (month slide) so focus rings on the last row aren't cut */}
        <div className={`grid gap-x-10 gap-y-8 overflow-x-clip ${months === 2 ? 'md:grid-cols-2' : ''}`}>
          {visible.map((month) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition(DURATION.ui)}
            >
              <h3 className="flex h-9 items-center justify-center text-body tracking-[-0.01em]">
                {formatMonth(month)}
              </h3>
              <div role="grid" aria-label={formatMonth(month)} className="mt-4">
                <div role="row" className="grid grid-cols-7">
                  {WEEKDAYS.map((d) => (
                    <span
                      key={d}
                      role="columnheader"
                      className="pb-2 text-center font-mono text-label tracking-label text-graphite-600 uppercase"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                {monthGrid(month).map((week, w) => (
                  <div role="row" key={w} className="grid grid-cols-7">
                    {week.map((iso, d) =>
                      iso ? (
                        <Day
                          key={iso}
                          iso={iso}
                          today={today}
                          unavailable={!!isUnavailable?.(iso)}
                          checkIn={checkIn}
                          rangeEnd={rangeEnd}
                          committedEnd={checkOut}
                          tabbable={iso === focused}
                          onPick={() => {
                            setFocused(iso)
                            onPick(iso)
                          }}
                          onHover={() => setHovered(iso)}
                        />
                      ) : (
                        <span role="gridcell" key={`pad-${d}`} />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${checkIn}-${checkOut}-${selecting}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition(DURATION.micro)}
            className="font-mono text-label text-graphite-600 tabular-nums"
            aria-live="polite"
          >
            {checkIn && checkOut ? (
              <>
                <span className="text-ink">
                  {formatShortDate(checkIn)} → {formatShortDate(checkOut)}
                </span>{' '}
                · {nights} {nights === 1 ? 'night' : 'nights'}
              </>
            ) : selecting === 'checkOut' && checkIn ? (
              `Check-in ${formatShortDate(checkIn)} — now pick check-out`
            ) : (
              'Pick a check-in date'
            )}
          </motion.p>
        </AnimatePresence>
        <button
          type="button"
          onClick={onClear}
          disabled={!checkIn}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-body whitespace-nowrap text-ink underline-offset-4 transition-colors duration-500 ease-cinematic hover:bg-sand disabled:pointer-events-none disabled:text-stone-500"
        >
          <X size={14} strokeWidth={1.5} /> Clear dates
        </button>
      </div>
      {legend && <p className="mt-2 font-mono text-label text-graphite-600">{legend}</p>}
    </div>
  )
}

function Day({
  iso,
  today,
  unavailable,
  checkIn,
  rangeEnd,
  committedEnd,
  tabbable,
  onPick,
  onHover,
}: {
  iso: string
  today: string
  unavailable: boolean
  checkIn: string
  rangeEnd: string
  committedEnd: string
  tabbable: boolean
  onPick: () => void
  onHover: () => void
}) {
  const past = iso < today
  // The picked range's own ends stay pickable, so a booked day can't hide them
  const disabled = past || (unavailable && iso !== checkIn && iso !== committedEnd)
  const isStart = iso === checkIn
  const isEnd = iso === committedEnd
  const inRange = !!checkIn && !!rangeEnd && iso > checkIn && iso < rangeEnd
  const isPreviewEnd = !!rangeEnd && iso === rangeEnd && !committedEnd
  const hasBand = !!checkIn && !!rangeEnd && (inRange || (isStart && rangeEnd > checkIn) || iso === rangeEnd)

  const label = [
    formatLongDate(iso),
    isStart && 'check-in',
    isEnd && 'check-out',
    iso === today && 'today',
    past ? 'unavailable' : disabled && 'not available',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div role="gridcell" aria-selected={isStart || isEnd} className="relative flex h-11 items-center justify-center">
      {/* Range band */}
      {hasBand && (
        <span
          aria-hidden
          className={`absolute inset-y-0.5 bg-sand ${
            isStart ? 'right-0 left-1/2' : iso === rangeEnd ? 'right-1/2 left-0' : 'inset-x-0'
          }`}
        />
      )}
      <button
        type="button"
        data-date={iso}
        tabIndex={tabbable ? 0 : -1}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => !disabled && onPick()}
        // Preview only for a real mouse and keyboard focus. A tap fires enter and focus first; if
        // that repaints the grid, iOS Safari treats the tap as a hover and never sends the click.
        onPointerEnter={(e) => e.pointerType === 'mouse' && !disabled && onHover()}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && !disabled && onHover()}
        className={`relative grid size-10 place-items-center rounded-full text-body tabular-nums transition-colors duration-300 ease-cinematic ${
          isStart || isEnd
            ? 'bg-accent text-milk'
            : isPreviewEnd
              ? 'border border-ink bg-sand text-ink'
              : disabled
                ? 'cursor-not-allowed text-stone-500 line-through decoration-stone-300'
                : 'text-ink hover:border hover:border-ink hover:bg-sand'
        }`}
      >
        {Number(iso.slice(8))}
        {iso === today && !(isStart || isEnd) && (
          <span aria-hidden className="absolute bottom-1.5 size-1 rounded-full bg-accent" />
        )}
      </button>
    </div>
  )
}

function NavButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="relative z-10 grid size-9 place-items-center rounded-full text-ink transition-colors duration-500 ease-cinematic hover:bg-sand disabled:pointer-events-none disabled:text-stone-300"
    >
      {children}
    </button>
  )
}
