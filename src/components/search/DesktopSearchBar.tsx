import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { formatShortDate } from '../../lib/dates'
import { guestSummary } from '../../lib/filters'
import { DURATION, transition } from '../../lib/motion'
import type { SearchViewProps } from './SearchBar'
import { DateRangeCalendar, pickDate } from './DateRangeCalendar'
import { DestinationPanel } from './DestinationPanel'
import { GuestsPanel } from './GuestsPanel'
import { Popover } from './Popover'
import { useDestinationCombobox } from './useDestinationCombobox'

type SegmentId = 'where' | 'checkIn' | 'checkOut' | 'guests'
const ORDER: SegmentId[] = ['where', 'checkIn', 'checkOut', 'guests']

export function DesktopSearchBar({ filters, onChange, onSubmit, recent, popoverDirection = 'up' }: SearchViewProps) {
  const [active, setActive] = useState<SegmentId | null>(null)
  const [hovered, setHovered] = useState<SegmentId | null>(null)
  /** Popover opened from the keyboard → move focus into it. */
  const [viaKeyboard, setViaKeyboard] = useState(false)
  const root = useRef<HTMLFormElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const triggers = useRef<Partial<Record<SegmentId, HTMLButtonElement | null>>>({})
  const uid = useId()
  const ids = { list: `${uid}-where`, dates: `${uid}-dates`, guests: `${uid}-guests` }

  const combobox = useDestinationCombobox({
    listId: ids.list,
    query: filters.query,
    recent,
    onPick: (option, via) => {
      onChange(option.patch)
      if (option.section === 'recent') {
        // A recent search restores everything — done
        setActive(null)
        return
      }
      // Continue the flow to dates, like Airbnb
      setViaKeyboard(via === 'keyboard')
      setActive('checkIn')
    },
  })

  // Close on outside pointer
  useEffect(() => {
    if (!active) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setActive(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [active])

  const open = (segment: SegmentId, e?: MouseEvent) => {
    // `detail === 0` → the click came from Enter / Space
    setViaKeyboard(e ? e.detail === 0 : false)
    setActive((current) => (current === segment && segment !== 'where' ? null : segment))
  }

  const closeAndRefocus = () => {
    if (!active) return
    const target = active === 'where' ? input.current : triggers.current[active]
    setActive(null)
    target?.focus()
  }

  const onPickDate = (iso: string) => {
    const selecting = active === 'checkOut' ? 'checkOut' : 'checkIn'
    const { checkIn, checkOut, next } = pickDate(filters, selecting, iso)
    onChange({ checkIn, checkOut })
    // A complete range keeps the calendar open on Check out; it closes when Guests is opened
    setActive(next ?? 'checkOut')
  }

  const dividerHidden = (i: number) =>
    [ORDER[i], ORDER[i + 1]].some((s) => s === active || s === hovered)

  const segmentClass = (id: SegmentId) =>
    `flex min-w-0 items-center rounded-full transition-[background-color,box-shadow] duration-500 ease-cinematic ${
      active === id ? 'bg-milk shadow-lift' : active ? 'hover:bg-milk/60' : 'hover:bg-ink/5'
    }`

  const hoverProps = (id: SegmentId) => ({
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
  })

  const datesValue = { checkIn: formatShortDate(filters.checkIn), checkOut: formatShortDate(filters.checkOut) }
  const guests = guestSummary(filters)

  return (
    <form
      ref={root}
      role="search"
      aria-label="Find a stay"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        setActive(null)
        onSubmit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && active) {
          e.preventDefault()
          closeAndRefocus()
        }
      }}
      onBlur={(e) => {
        // Tabbing out of the whole bar closes any popover
        if (e.relatedTarget && !root.current?.contains(e.relatedTarget as Node)) setActive(null)
      }}
    >
      {/* Popovers */}
      <Popover direction={popoverDirection} open={active === 'where'} id={`${ids.list}-popover`} placement="left-0 w-[440px]" className="max-h-[calc(100svh-12rem)] overflow-y-auto overscroll-contain p-3 pt-5">
        <DestinationPanel
          listId={ids.list}
          query={filters.query}
          options={combobox.options}
          activeIndex={combobox.activeIndex}
          onSelect={combobox.pick}
          onHover={combobox.setActiveIndex}
        />
      </Popover>

      <Popover
        direction={popoverDirection}
        open={active === 'checkIn' || active === 'checkOut'}
        id={ids.dates}
        label="Choose dates"
        placement="left-1/2 w-[760px] -translate-x-1/2"
        className="p-8"
      >
        <DateRangeCalendar
          checkIn={filters.checkIn}
          checkOut={filters.checkOut}
          selecting={active === 'checkOut' ? 'checkOut' : 'checkIn'}
          onPick={onPickDate}
          onClear={() => {
            onChange({ checkIn: '', checkOut: '' })
            setActive('checkIn')
          }}
          autoFocus={viaKeyboard}
        />
      </Popover>

      <Popover direction={popoverDirection} open={active === 'guests'} id={ids.guests} label="Guests" placement="right-0 w-[400px]" className="px-8 pt-3 pb-6">
        <GuestsPanel adults={filters.adults} children={filters.children} pets={filters.pets} onChange={onChange} autoFocus={viaKeyboard} />
      </Popover>

      {/* Bar */}
      <div
        className={`flex items-center rounded-full border p-1.5 shadow-soft transition-colors duration-500 ease-cinematic ${
          active ? 'border-sand bg-sand' : 'border-line bg-milk'
        }`}
      >
        {/* Where */}
        <div className={`${segmentClass('where')} flex-[1.4]`} {...hoverProps('where')}>
          <label className="flex min-w-0 flex-1 cursor-text flex-col gap-1 py-3 pr-2 pl-7">
            <SegmentLabel>Where</SegmentLabel>
            <input
              ref={input}
              type="text"
              value={filters.query}
              placeholder="Search destinations"
              autoComplete="off"
              aria-expanded={active === 'where'}
              {...combobox.inputProps}
              onFocus={() => setActive('where')}
              onChange={(e) => {
                onChange({ query: e.target.value })
                combobox.resetHighlight()
                setActive('where')
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && active !== 'where') setActive('where')
                combobox.onKeyDown(e)
              }}
              className="w-full truncate bg-transparent text-body text-ink placeholder:text-graphite-600 focus:outline-none"
            />
          </label>
          <ClearButton
            show={active === 'where' && !!filters.query}
            label="Clear destination"
            onClick={() => {
              onChange({ query: '' })
              input.current?.focus()
            }}
          />
        </div>

        <Divider hidden={dividerHidden(0)} />

        {/* Check in */}
        <div className={`${segmentClass('checkIn')} flex-1`} {...hoverProps('checkIn')}>
          <SegmentTrigger
            ref={(el) => {
              triggers.current.checkIn = el
            }}
            label="Check in"
            value={datesValue.checkIn}
            placeholder="Add dates"
            expanded={active === 'checkIn'}
            controls={ids.dates}
            onClick={(e) => open('checkIn', e)}
          />
          <ClearButton
            show={active === 'checkIn' && !!filters.checkIn}
            label="Clear dates"
            onClick={() => onChange({ checkIn: '', checkOut: '' })}
          />
        </div>

        <Divider hidden={dividerHidden(1)} />

        {/* Check out */}
        <div className={`${segmentClass('checkOut')} flex-1`} {...hoverProps('checkOut')}>
          <SegmentTrigger
            ref={(el) => {
              triggers.current.checkOut = el
            }}
            label="Check out"
            value={datesValue.checkOut}
            placeholder="Add dates"
            expanded={active === 'checkOut'}
            controls={ids.dates}
            onClick={(e) => open('checkOut', e)}
          />
          <ClearButton
            show={active === 'checkOut' && !!filters.checkOut}
            label="Clear dates"
            onClick={() => {
              onChange({ checkIn: '', checkOut: '' })
              setActive('checkIn')
            }}
          />
        </div>

        <Divider hidden={dividerHidden(2)} />

        {/* Guests + CTA */}
        <div className={`${segmentClass('guests')} flex-[1.5] pr-1`} {...hoverProps('guests')}>
          <SegmentTrigger
            ref={(el) => {
              triggers.current.guests = el
            }}
            label="Guests"
            value={guests}
            placeholder="Add guests"
            expanded={active === 'guests'}
            controls={ids.guests}
            onClick={(e) => open('guests', e)}
          />
          <ClearButton
            show={active === 'guests' && !!guests}
            label="Clear guests"
            onClick={() => onChange({ adults: 0, children: 0, pets: false })}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={transition(DURATION.micro)}
            className="flex h-13 shrink-0 items-center gap-2.5 rounded-full bg-accent pr-6 pl-5 text-body whitespace-nowrap text-milk transition-colors duration-500 ease-cinematic hover:bg-accent-hover"
          >
            <Search size={16} strokeWidth={1.5} />
            <span>Show stays</span>
          </motion.button>
        </div>
      </div>
    </form>
  )
}

function SegmentLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-label leading-none tracking-label text-ink uppercase">{children}</span>
}

function SegmentTrigger({
  ref,
  label,
  value,
  placeholder,
  expanded,
  controls,
  onClick,
}: {
  ref: (el: HTMLButtonElement | null) => void
  label: string
  value: string
  placeholder: string
  expanded: boolean
  controls: string
  onClick: (e: MouseEvent) => void
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-controls={expanded ? controls : undefined}
      className="flex min-w-0 flex-1 flex-col items-start gap-1 rounded-full py-3 pr-2 pl-6 text-left focus-visible:outline-offset-[-6px]"
    >
      <SegmentLabel>{label}</SegmentLabel>
      <span className={`w-full truncate text-body ${value ? 'text-ink' : 'text-graphite-600'}`}>{value || placeholder}</span>
    </button>
  )
}

function Divider({ hidden }: { hidden: boolean }) {
  return (
    <span
      aria-hidden
      className={`h-8 w-px shrink-0 bg-line transition-opacity duration-500 ease-cinematic ${hidden ? 'opacity-0' : ''}`}
    />
  )
}

function ClearButton({ show, label, onClick }: { show: boolean; label: string; onClick: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label={label}
          onClick={onClick}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={transition(DURATION.micro)}
          className="mr-3 grid size-6 shrink-0 place-items-center rounded-full bg-sand text-ink transition-colors duration-500 ease-cinematic hover:bg-ink hover:text-milk"
        >
          <X size={12} strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
