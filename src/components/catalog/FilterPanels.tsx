import { useId, type ReactNode } from 'react'
import { Bath, Check, Flame, Heater, Laptop, PlugZap, Sun, WavesLadder, Zap } from 'lucide-react'
import { CONFIRMATION, OFF_GRID } from '../../data/copy'
import { stays, type Amenity } from '../../data/stays'
import {
  AMENITIES,
  AMENITY_LABELS,
  MAX_BEDROOMS,
  priceBounds,
  typeOptions,
  type Filters,
} from '../../lib/filters'
import { priceFormat } from '../../lib/format'
import { typeset } from '../../lib/typography'
import { GuestsPanel, StepperRow, Switch } from '../search/GuestsPanel'

/**
 * Filter panels shared by the filter-bar popovers and the "All filters" sheet.
 * Each applies live through `onChange(patch)`.
 */
export type PanelProps = {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
}

const PRICE = priceBounds(stays)
const PRICE_STEP = 10
const BINS = 16
const TYPES = typeOptions(stays)

/** Stay counts per price bin, for the histogram above the slider. */
const histogram = Array.from({ length: BINS }, (_, i) => {
  const from = PRICE.min + ((PRICE.max - PRICE.min) / BINS) * i
  const to = from + (PRICE.max - PRICE.min) / BINS
  return {
    from,
    to,
    count: stays.filter((s) => s.pricePerNight >= from && (s.pricePerNight < to || (i === BINS - 1 && s.pricePerNight <= to))).length,
  }
})
const tallest = Math.max(...histogram.map((b) => b.count))

const pct = (v: number) => (v - PRICE.min) / (PRICE.max - PRICE.min)
/** Position along the track, inset by half a thumb (12px) at each end. */
const along = (v: number) => `calc(${pct(v)} * (100% - 1.5rem) + 0.75rem)`

/* ─── Price ─────────────────────────────────────────────────────────────── */

export function PricePanel({ filters, onChange }: PanelProps) {
  const lo = filters.priceMin || PRICE.min
  const hi = filters.priceMax || PRICE.max

  // The bounds themselves mean "open-ended", stored as 0
  const set = (nextLo: number, nextHi: number) =>
    onChange({
      priceMin: nextLo <= PRICE.min ? 0 : nextLo,
      priceMax: nextHi >= PRICE.max ? 0 : nextHi,
    })

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body leading-[1.55] text-graphite-600">
        {typeset('Price per night, before taxes. The cleaning fee is charged once per stay.')}
      </p>

      <div className="px-3">
        <div aria-hidden className="flex h-16 items-end gap-1">
          {histogram.map((bin) => {
            const inRange = bin.to > lo && bin.from < hi
            return (
              <span
                key={bin.from}
                style={{ height: bin.count ? `${(bin.count / tallest) * 100}%` : '2px' }}
                className={`flex-1 rounded-t-full transition-colors duration-500 ease-cinematic ${
                  !bin.count ? 'bg-line' : inRange ? 'bg-ink' : 'bg-stone-300'
                }`}
              />
            )
          })}
        </div>
      </div>

      <div className="relative -mt-3 h-6">
        <span aria-hidden className="absolute inset-x-3 top-1/2 h-px bg-line" />
        <span
          aria-hidden
          className="absolute top-1/2 h-px bg-ink"
          style={{ left: along(lo), right: `calc(100% - ${along(hi)})` }}
        />
        <input
          type="range"
          min={PRICE.min}
          max={PRICE.max}
          step={PRICE_STEP}
          value={lo}
          onChange={(e) => set(Math.min(Number(e.target.value), hi - PRICE_STEP), hi)}
          aria-label="Minimum price per night"
          aria-valuetext={priceFormat.format(lo)}
          // Lift the lower thumb when both sit at the top end, so it can still be dragged
          style={{ zIndex: pct(lo) > 0.9 ? 2 : 1 }}
          className="range-thumbs"
        />
        <input
          type="range"
          min={PRICE.min}
          max={PRICE.max}
          step={PRICE_STEP}
          value={hi}
          onChange={(e) => set(lo, Math.max(Number(e.target.value), lo + PRICE_STEP))}
          aria-label="Maximum price per night"
          aria-valuetext={priceFormat.format(hi)}
          className="range-thumbs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PriceReadout label="Minimum" value={priceFormat.format(lo)} />
        <PriceReadout label="Maximum" value={`${priceFormat.format(hi)}${hi >= PRICE.max ? '+' : ''}`} />
      </div>
    </div>
  )
}

function PriceReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line px-4 py-3">
      <span className="font-mono text-label tracking-label text-graphite-600 uppercase">{label}</span>
      <span className="font-mono text-body text-ink tabular-nums">{value}</span>
    </div>
  )
}

/* ─── Type of stay ──────────────────────────────────────────────────────── */

export function TypePanel({ filters, onChange }: PanelProps) {
  return (
    <fieldset className="flex flex-col">
      <legend className="sr-only">Type of stay</legend>
      {TYPES.map(({ type, label, count }) => {
        const checked = filters.types.includes(type)
        return (
          <label
            key={type}
            className="group flex cursor-pointer items-center gap-4 border-b border-line py-3.5 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onChange({ types: checked ? filters.types.filter((t) => t !== type) : [...filters.types, type] })
              }
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-500 ease-cinematic peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent ${
                checked ? 'border-ink bg-ink text-milk' : 'border-stone-300 group-hover:border-ink'
              }`}
            >
              {checked && <Check size={12} strokeWidth={1.5} />}
            </span>
            <span className="flex-1 text-body tracking-[-0.01em]">{label}</span>
            <span className="font-mono text-label text-graphite-600 tabular-nums">{count}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

/* ─── Capacity ──────────────────────────────────────────────────────────── */

export function CapacityPanel({ filters, onChange }: PanelProps) {
  return (
    // Bedrooms first: GuestsPanel closes with its own footnote
    <div className="flex flex-col">
      <StepperRow
        label="Bedrooms"
        unit="bedroom"
        hint="At least this many"
        value={filters.bedrooms}
        min={0}
        canAdd={filters.bedrooms < MAX_BEDROOMS}
        onChange={(bedrooms) => onChange({ bedrooms })}
      />
      <GuestsPanel adults={filters.adults} children={filters.children} pets={filters.pets} onChange={onChange} />
    </div>
  )
}

/* ─── Amenities ─────────────────────────────────────────────────────────── */

const AMENITY_ICONS: Record<Amenity, ReactNode> = {
  sauna: <Heater size={16} strokeWidth={1.5} />,
  'hot-tub': <Bath size={16} strokeWidth={1.5} />,
  fireplace: <Flame size={16} strokeWidth={1.5} />,
  pool: <WavesLadder size={16} strokeWidth={1.5} />,
  workspace: <Laptop size={16} strokeWidth={1.5} />,
  'ev-charger': <PlugZap size={16} strokeWidth={1.5} />,
}

export function AmenitiesPanel({ filters, onChange }: PanelProps) {
  return (
    <div role="group" aria-label="Amenities" className="grid grid-cols-2 gap-2">
      {AMENITIES.map((amenity) => {
        const on = filters.amenities.includes(amenity)
        return (
          <button
            key={amenity}
            type="button"
            aria-pressed={on}
            onClick={() =>
              onChange({ amenities: on ? filters.amenities.filter((a) => a !== amenity) : [...filters.amenities, amenity] })
            }
            className={`flex h-12 items-center gap-3 rounded-full border px-4 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic ${
              on ? 'border-ink bg-ink text-milk' : 'border-line text-ink hover:border-ink'
            }`}
          >
            {AMENITY_ICONS[amenity]}
            {AMENITY_LABELS[amenity]}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Features ──────────────────────────────────────────────────────────── */

export function FeaturesPanel({ filters, onChange }: PanelProps) {
  return (
    <div className="flex flex-col">
      <FeatureRow
        icon={<Sun size={18} strokeWidth={1.5} />}
        title={OFF_GRID.title}
        hint={OFF_GRID.body}
        checked={filters.offGrid}
        onChange={(offGrid) => onChange({ offGrid })}
      />
      <FeatureRow
        icon={<Zap size={18} strokeWidth={1.5} />}
        title="Instant book"
        hint={CONFIRMATION.instant.body}
        checked={filters.instantBook}
        onChange={(instantBook) => onChange({ instantBook })}
      />
    </div>
  )
}

function FeatureRow({
  icon,
  title,
  hint,
  checked,
  onChange,
}: {
  icon: ReactNode
  title: string
  hint: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-5 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-ink">{icon}</span>
        <div className="flex flex-col gap-1">
          <span id={`${id}-title`} className="text-body tracking-[-0.01em]">
            {title}
          </span>
          <span id={`${id}-hint`} className="text-body text-graphite-600">
            {typeset(hint)}
          </span>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} labelledBy={`${id}-title`} describedBy={`${id}-hint`} />
    </div>
  )
}
