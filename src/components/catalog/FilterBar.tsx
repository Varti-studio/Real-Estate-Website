import { useId, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, Map as MapIcon, SlidersHorizontal, Sun, Zap } from 'lucide-react'
import { SORT_LABELS, SORTS, type SortKey } from '../../lib/catalog'
import { guestCount, priceLabel, refinementCount, type Filters } from '../../lib/filters'
import { DURATION, transition } from '../../lib/motion'
import { Popover } from '../search/Popover'
import type { SheetSection } from './AllFiltersSheet'
import { FilterPill } from './FilterPill'
import { CapacityPanel, PricePanel, TypePanel, type PanelProps } from './FilterPanels'
import { SegmentedControl } from './SegmentedControl'
import { useDismiss } from './useDismiss'

export type CatalogView = 'map' | 'grid'

type MenuId = 'price' | 'type' | 'capacity'

const MENUS: {
  id: MenuId
  label: string
  width: string
  Panel: (p: PanelProps) => ReactNode
  value: (f: Filters) => string
  clear: Partial<Filters>
}[] = [
  { id: 'price', label: 'Price', width: 'w-[400px]', Panel: PricePanel, value: priceLabel, clear: { priceMin: 0, priceMax: 0 } },
  {
    id: 'type',
    label: 'Type of stay',
    width: 'w-[360px]',
    Panel: TypePanel,
    value: (f) => (f.types.length === 1 ? f.types[0] : f.types.length ? `${f.types.length} types` : ''),
    clear: { types: [] },
  },
  {
    id: 'capacity',
    label: 'Capacity',
    width: 'w-[400px]',
    Panel: CapacityPanel,
    value: (f) => {
      const n = guestCount(f)
      return [n && `${n} ${n === 1 ? 'guest' : 'guests'}`, f.bedrooms && `${f.bedrooms}+ bedrooms`].filter(Boolean).join(' · ')
    },
    clear: { adults: 0, children: 0, pets: false, bedrooms: 0 },
  },
]

type FilterBarProps = {
  filters: Filters
  resultCount: number
  onChange: (patch: Partial<Filters>) => void
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  view: CatalogView
  onViewChange: (view: CatalogView) => void
  onOpenSheet: (section: SheetSection | null) => void
}

/**
 * Desktop (`lg`+) filter row: quick filters (Price, Type, Capacity popovers;
 * toggles for Off-grid and Instant book), "All filters" with a count badge,
 * then sort and the Map / Grid switch (on one line from 1400px, the pills
 * alone need ~840px). Below `lg` the `MobileDock` stands in for all of it.
 */
export function FilterBar({ filters, onChange, sort, onSortChange, view, onViewChange, onOpenSheet }: FilterBarProps) {
  const [open, setOpen] = useState<MenuId | null>(null)
  const row = useRef<HTMLDivElement>(null)
  const triggers = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({})
  const uid = useId()
  const count = refinementCount(filters)

  useDismiss(row, open !== null, (reason) => {
    if (reason === 'escape' && open) triggers.current[open]?.focus()
    setOpen(null)
  })

  const toggleMenu = (id: MenuId) => setOpen((current) => (current === id ? null : id))

  return (
    <div className="hidden flex-col gap-4 lg:flex min-[1400px]:flex-row min-[1400px]:items-center min-[1400px]:justify-between min-[1400px]:gap-8">
      <div ref={row} className="flex items-center gap-2">
        {MENUS.map(({ id, label, width, Panel, value, clear }) => (
          <div key={id} className="relative shrink-0">
            <FilterPill
              ref={(el) => {
                triggers.current[id] = el
              }}
              kind="menu"
              label={label}
              value={value(filters)}
              expanded={open === id}
              controls={`${uid}-${id}`}
              onClick={() => toggleMenu(id)}
            />
            <Popover direction="down" open={open === id} id={`${uid}-${id}`} label={label} placement={`left-0 ${width}`} className="p-6">
              <Panel filters={filters} onChange={onChange} />
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => onChange(clear)}
                  disabled={!value(filters)}
                  className="text-body text-ink underline underline-offset-4 disabled:text-stone-300 disabled:no-underline"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(null)
                    triggers.current[id]?.focus()
                  }}
                  className="flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-body text-milk transition-colors duration-500 ease-cinematic hover:bg-graphite-800"
                >
                  Show stays
                </button>
              </div>
            </Popover>
          </div>
        ))}

        <FilterPill
          kind="toggle"
          label="Off-grid"
          icon={<Sun size={14} strokeWidth={1.5} />}
          pressed={filters.offGrid}
          onClick={() => onChange({ offGrid: !filters.offGrid })}
        />
        <FilterPill
          kind="toggle"
          label="Instant book"
          icon={<Zap size={14} strokeWidth={1.5} />}
          pressed={filters.instantBook}
          onClick={() => onChange({ instantBook: !filters.instantBook })}
        />

        <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />

        <button
          type="button"
          onClick={() => {
            setOpen(null)
            onOpenSheet(null)
          }}
          aria-haspopup="dialog"
          aria-label={count ? `All filters, ${count} applied` : 'All filters'}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line pr-2 pl-4 text-body tracking-[-0.01em] whitespace-nowrap transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-milk"
        >
          <SlidersHorizontal size={14} strokeWidth={1.5} />
          <span>All filters</span>
          <span className="grid size-6 place-items-center">
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key="badge"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={transition(DURATION.micro)}
                  className="grid size-6 place-items-center rounded-full bg-ink font-mono text-label tracking-normal text-milk tabular-nums"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 min-[1400px]:justify-end">
        <div className="flex items-center gap-3">
          <span className="eyebrow text-graphite-600">Sort</span>
          <SegmentedControl
            label="Sort by"
            layoutId="catalog-sort"
            value={sort}
            onChange={onSortChange}
            options={SORTS.map((value) => ({ value, label: SORT_LABELS[value] }))}
          />
        </div>
        <div>
          <SegmentedControl
            label="View"
            layoutId="catalog-view"
            value={view}
            onChange={onViewChange}
            options={[
              { value: 'map', label: 'Map', icon: <MapIcon size={14} strokeWidth={1.5} /> },
              { value: 'grid', label: 'Grid', icon: <LayoutGrid size={14} strokeWidth={1.5} /> },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
