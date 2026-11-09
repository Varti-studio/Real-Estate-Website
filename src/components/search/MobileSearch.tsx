import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { formatShortDate, nightsBetween } from '../../lib/dates'
import { SEARCH_BAR_DEFAULTS, guestSummary } from '../../lib/filters'
import { trapFocus } from '../../lib/focusTrap'
import { DURATION, transition } from '../../lib/motion'
import type { SearchViewProps } from './SearchBar'
import { DateRangeCalendar, pickDate, type DateField } from './DateRangeCalendar'
import { DestinationPanel } from './DestinationPanel'
import { GuestsPanel } from './GuestsPanel'
import { useDestinationCombobox } from './useDestinationCombobox'

type Section = 'where' | 'dates' | 'guests'

const OPEN_EVENT = 'solum:open-search'

/** Opens the mobile search sheet from elsewhere on the page (the catalogue's dock). */
export const openMobileSearch = () => window.dispatchEvent(new Event(OPEN_EVENT))

/** Below `lg`: a compact trigger that opens a full-screen search sheet. */
export function MobileSearch({ filters, resultCount, onChange, onSubmit, recent }: SearchViewProps) {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<Section>('where')
  const [selecting, setSelecting] = useState<DateField>('checkIn')
  const trigger = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const listId = `${useId()}-where`

  const combobox = useDestinationCombobox({
    listId,
    query: filters.query,
    recent,
    onPick: (option) => {
      onChange(option.patch)
      // A recent search with dates is complete — jump past the calendar
      setSection(option.section === 'recent' && option.patch.checkIn ? 'guests' : 'dates')
    },
  })

  const dates =
    filters.checkIn && filters.checkOut
      ? `${formatShortDate(filters.checkIn)} → ${formatShortDate(filters.checkOut)}`
      : filters.checkIn
        ? `${formatShortDate(filters.checkIn)} → …`
        : ''
  const nights = nightsBetween(filters.checkIn, filters.checkOut)
  const guests = guestSummary(filters)

  useEffect(() => {
    const onOpen = () => {
      setSection('where')
      setOpen(true)
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  // Lock page scroll and move focus into the sheet
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => sheet.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus())
    return () => {
      document.body.style.overflow = ''
      cancelAnimationFrame(frame)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }

  const onSheetKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    trapFocus(e, sheet.current)
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setSection('where')
          setOpen(true)
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center gap-4 rounded-full border border-line bg-milk py-2 pr-5 pl-2 text-left shadow-soft transition-colors duration-500 ease-cinematic hover:bg-paper"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-milk">
          <Search size={18} strokeWidth={1.5} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-body tracking-[-0.01em] text-ink">{filters.query || 'Where to?'}</span>
          <span className="truncate font-mono text-label text-graphite-600">
            {dates || 'Any week'} · {guests || 'Add guests'}
          </span>
        </span>
        <span className="shrink-0 font-mono text-label whitespace-nowrap text-graphite-600 tabular-nums">
          {`${resultCount} ${resultCount === 1 ? 'stay' : 'stays'}`}
        </span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={sheet}
              role="dialog"
              aria-modal="true"
              aria-label="Search stays"
              onKeyDown={onSheetKeyDown}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={transition(DURATION.ui)}
              className="fixed inset-0 z-[60] flex flex-col bg-paper text-ink lg:hidden"
            >
              <header className="flex items-center justify-between px-4 pt-4 pb-3">
                <button
                  type="button"
                  data-autofocus
                  onClick={close}
                  aria-label="Close search"
                  className="grid size-11 place-items-center rounded-full border border-line bg-milk transition-colors duration-500 ease-cinematic hover:bg-ink hover:text-milk"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
                <span className="eyebrow text-ink">Find a stay</span>
                <span className="size-11" aria-hidden />
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
                <SheetCard
                  label="Where"
                  title="Where to?"
                  value={filters.query || 'Anywhere'}
                  open={section === 'where'}
                  onOpen={() => setSection('where')}
                >
                  <label className="flex h-13 items-center gap-3 rounded-full border border-stone-300 px-5 focus-within:border-ink">
                    <Search size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="sr-only">Destination</span>
                    <input
                      type="text"
                      value={filters.query}
                      placeholder="Search destinations"
                      autoComplete="off"
                      aria-expanded
                      {...combobox.inputProps}
                      onChange={(e) => {
                        onChange({ query: e.target.value })
                        combobox.resetHighlight()
                      }}
                      onKeyDown={combobox.onKeyDown}
                      className="w-full bg-transparent text-body text-ink placeholder:text-graphite-600 focus:outline-none"
                    />
                    {filters.query && (
                      <button
                        type="button"
                        aria-label="Clear destination"
                        onClick={() => onChange({ query: '' })}
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-sand"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    )}
                  </label>
                  <div className="-mx-2 mt-5">
                    <DestinationPanel
                      listId={listId}
                      query={filters.query}
                      options={combobox.options}
                      activeIndex={combobox.activeIndex}
                      onSelect={combobox.pick}
                      onHover={combobox.setActiveIndex}
                    />
                  </div>
                </SheetCard>

                <SheetCard
                  label="When"
                  title="When’s your stay?"
                  value={dates ? `${dates}${nights ? ` · ${nights}n` : ''}` : 'Add dates'}
                  open={section === 'dates'}
                  onOpen={() => {
                    setSelecting(filters.checkIn && !filters.checkOut ? 'checkOut' : 'checkIn')
                    setSection('dates')
                  }}
                >
                  <DateRangeCalendar
                    months={1}
                    checkIn={filters.checkIn}
                    checkOut={filters.checkOut}
                    selecting={selecting}
                    onPick={(iso) => {
                      const r = pickDate(filters, selecting, iso)
                      onChange({ checkIn: r.checkIn, checkOut: r.checkOut })
                      // A complete range keeps the calendar open; it closes when "Who" is opened
                      setSelecting(r.next ?? 'checkIn')
                    }}
                    onClear={() => {
                      onChange({ checkIn: '', checkOut: '' })
                      setSelecting('checkIn')
                    }}
                  />
                </SheetCard>

                <SheetCard
                  label="Who"
                  title="Who’s coming?"
                  value={guests || 'Add guests'}
                  open={section === 'guests'}
                  onOpen={() => setSection('guests')}
                >
                  <GuestsPanel adults={filters.adults} children={filters.children} pets={filters.pets} onChange={onChange} />
                </SheetCard>
              </div>

              <footer className="flex items-center justify-between gap-4 border-t border-line bg-milk px-4 py-4">
                <button
                  type="button"
                  onClick={() => {
                    onChange(SEARCH_BAR_DEFAULTS)
                    setSelecting('checkIn')
                    setSection('where')
                  }}
                  className="text-body text-ink underline underline-offset-4"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    close()
                    onSubmit()
                  }}
                  className="flex h-13 items-center gap-2.5 rounded-full bg-accent px-6 text-body text-milk transition-colors duration-500 ease-cinematic hover:bg-accent-hover"
                >
                  <Search size={16} strokeWidth={1.5} />
                  <span>Show stays</span>
                </button>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

function SheetCard({
  label,
  title,
  value,
  open,
  onOpen,
  children,
}: {
  label: string
  title: string
  value: string
  open: boolean
  onOpen: () => void
  children: ReactNode
}) {
  return (
    <section className="rounded-card border border-line bg-milk shadow-lift">
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(DURATION.ui)}
          className="p-5"
        >
          <h2 className="text-h3 leading-[1.1] font-light tracking-[-0.03em]">{title}</h2>
          <div className="mt-5">{children}</div>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          aria-expanded={false}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
        >
          <span className="text-body text-graphite-600">{label}</span>
          <span className="truncate text-body text-ink">{value}</span>
        </button>
      )}
    </section>
  )
}
