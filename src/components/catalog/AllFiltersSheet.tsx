import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SORT_LABELS, SORTS, type SortKey } from '../../lib/catalog'
import { clearRefinements, refinementCount, type Filters } from '../../lib/filters'
import { pad } from '../../lib/format'
import { fadeUp } from '../../lib/motion'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Sheet } from '../ui/Sheet'
import { SegmentedControl } from './SegmentedControl'
import { AmenitiesPanel, CapacityPanel, FeaturesPanel, PricePanel, TypePanel, type PanelProps } from './FilterPanels'

export type SheetSection = 'sort' | 'price' | 'type' | 'capacity' | 'amenities' | 'features'

const SECTIONS: { id: Exclude<SheetSection, 'sort'>; title: string; Panel: (p: PanelProps) => ReactNode }[] = [
  { id: 'price', title: 'Price', Panel: PricePanel },
  { id: 'type', title: 'Type of stay', Panel: TypePanel },
  { id: 'capacity', title: 'Capacity', Panel: CapacityPanel },
  { id: 'amenities', title: 'Amenities', Panel: AmenitiesPanel },
  { id: 'features', title: 'Features', Panel: FeaturesPanel },
]

type AllFiltersSheetProps = {
  open: boolean
  /** Section to scroll to on open (a quick pill tapped below `lg`). */
  section: SheetSection | null
  filters: Filters
  resultCount: number
  onChange: (patch: Partial<Filters>) => void
  onReplace: (next: Filters) => void
  onClose: () => void
  /** Below `lg` sort lives here (the desktop filter bar has its own control). */
  sort: SortKey
  onSortChange: (sort: SortKey) => void
}

/** Every refinement in one place, in a side sheet (full screen on mobile). */
export function AllFiltersSheet({ open, section, filters, onChange, onReplace, onClose, sort, onSortChange }: AllFiltersSheetProps) {
  const count = refinementCount(filters)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  // Below `lg` sort leads the sheet; indices count from it
  const offset = isDesktop ? 0 : 1

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      count={count}
      // Land on the requested section
      onOpened={(body) => {
        const target = section ? body.querySelector<HTMLElement>(`[data-section="${section}"]`) : null
        if (target) body.scrollTo({ top: target.offsetTop - 24 })
      }}
      footer={
        <>
          <button
            type="button"
            onClick={() => onReplace(clearRefinements(filters))}
            disabled={count === 0}
            className="text-body text-ink underline underline-offset-4 transition-colors duration-500 ease-cinematic disabled:text-stone-300 disabled:no-underline"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-13 items-center gap-2 rounded-full bg-accent px-6 text-body text-milk transition-colors duration-500 ease-cinematic hover:bg-accent-hover"
          >
            Show stays
          </button>
        </>
      }
    >
      {!isDesktop && (
        <SheetSectionBlock id="sort" index={1} title="Sort by">
          <SegmentedControl
            label="Sort by"
            layoutId="sheet-sort"
            value={sort}
            onChange={onSortChange}
            options={SORTS.map((value) => ({ value, label: SORT_LABELS[value] }))}
          />
        </SheetSectionBlock>
      )}
      {SECTIONS.map(({ id, title, Panel }, i) => (
        <SheetSectionBlock key={id} id={id} index={i + 1 + offset} title={title}>
          <Panel filters={filters} onChange={onChange} />
        </SheetSectionBlock>
      ))}
    </Sheet>
  )
}

function SheetSectionBlock({ id, index, title, children }: { id: SheetSection; index: number; title: string; children: ReactNode }) {
  return (
    <motion.section
      data-section={id}
      variants={fadeUp}
      aria-labelledby={`sheet-${id}`}
      className="border-b border-line py-8 last:border-b-0"
    >
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-label text-graphite-600 tabular-nums">({pad(index)})</span>
        <h3 id={`sheet-${id}`} className="text-title tracking-[-0.02em]">
          {title}
        </h3>
      </div>
      {children}
    </motion.section>
  )
}
