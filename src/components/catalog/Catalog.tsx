import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { List } from 'lucide-react'
import { stays } from '../../data/stays'
import { nightsBetween } from '../../lib/dates'
import { activeFilters, clearFilter, filterStays, refinementCount, type Filters } from '../../lib/filters'
import {
  pageCount,
  paginate,
  sortStays,
  withinBounds,
  type Bounds,
  type CatalogState,
  type SortKey,
} from '../../lib/catalog'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../../lib/motion'
import { stayUrl } from '../../lib/stay'
import { typeset } from '../../lib/typography'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { MonoLabel } from '../ui/MonoLabel'
import { StayCard } from '../StayCard'
import { AllFiltersSheet, type SheetSection } from './AllFiltersSheet'
import { AppliedFilters } from './AppliedFilters'
import { FilterBar, type CatalogView } from './FilterBar'
import { MobileDock } from './MobileDock'
import { Pagination } from './Pagination'
import { headlineText, ResultsHeader, resultsHeadline } from './ResultsHeader'
import type { StayMapProps } from './map/StayMap'

const StayMap = lazy(() => import('./map/StayMap'))

type CatalogProps = {
  filters: Filters
  sort: SortKey
  page: number
  /** Writes filters / sort / page to the URL; a filter change resets the page. */
  onChange: (next: Partial<CatalogState> & { filters?: Filters }) => void
  onReset: () => void
}

/**
 * The /search catalogue: filter bar, applied tags, results heading, then the
 * list beside a sticky map (or a full-width grid). Owns the interactive
 * state — hovered card, active pin, map bounds, view, sheet — while filters,
 * sort and page live in the URL.
 */
export function Catalog({ filters, sort, page, onChange, onReset }: CatalogProps) {
  // Desktop always opens on the map; Grid lasts for the visit
  const [view, setView] = useState<CatalogView>('map')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pinId, setPinId] = useState<string | null>(null)
  const [searchAsMove, setSearchAsMove] = useState(false)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [sheet, setSheet] = useState<{ open: boolean; section: SheetSection | null }>({ open: false, section: null })
  const [mobileMap, setMobileMap] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion()
  const top = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLUListElement>(null)
  const gridInView = useInView(gridRef, inView)

  /* filter → map area → sort → page */
  const matched = useMemo(() => filterStays(stays, filters), [filters])
  const inArea = useMemo(
    () => (searchAsMove && bounds ? matched.filter((s) => withinBounds(s, bounds)) : matched),
    [matched, searchAsMove, bounds],
  )
  const sorted = useMemo(() => sortStays(inArea, sort), [inArea, sort])
  const pages = pageCount(sorted.length)
  const current = Math.min(page, pages)
  const visible = paginate(sorted, current)
  const headline = resultsHeadline(filters, inArea)
  const nights = nightsBetween(filters.checkIn, filters.checkOut)
  const split = view === 'map' && isDesktop

  const title = headlineText(headline)
  useEffect(() => {
    document.title = `${title} — Solum`
  }, [title])

  const patch = (p: Partial<Filters>) => onChange({ filters: { ...filters, ...p } })

  const onCardActive = useCallback((id: string, active: boolean) => {
    setHoveredId((prev) => (active ? id : prev === id ? null : prev))
  }, [])

  const closeMobileMap = useCallback(() => setMobileMap(false), [])

  const goToPage = (next: number) => {
    onChange({ page: next })
    top.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const mapProps: StayMapProps = {
    stays,
    results: sorted,
    fitTo: matched,
    highlightedId: hoveredId,
    activeId: pinId,
    onActiveChange: setPinId,
    stayHref: (stay) => stayUrl(stay.id, filters),
    searchAsMove,
    onSearchAsMoveChange: (on) => {
      setSearchAsMove(on)
      if (page > 1) onChange({ page: 1 })
    },
    onBoundsChange: (b) => {
      setBounds(b)
      if (searchAsMove && page > 1) onChange({ page: 1 })
    },
  }

  const reset = () => {
    setSearchAsMove(false)
    onReset()
  }

  return (
    <section id="stays" aria-label="Search results" className="container-x pb-24 lg:pb-40">
      {/* Filters */}
      <div className="flex flex-col gap-5 border-b border-line pb-6">
        <FilterBar
          filters={filters}
          resultCount={inArea.length}
          onChange={patch}
          sort={sort}
          onSortChange={(next) => onChange({ sort: next, page: 1 })}
          view={view}
          onViewChange={setView}
          onOpenSheet={(section) => setSheet({ open: true, section })}
        />
        <AppliedFilters
          chips={activeFilters(filters)}
          onRemove={(chip) => onChange({ filters: clearFilter(filters, chip) })}
          onClearAll={reset}
        />
      </div>

      <div ref={top} className="scroll-mt-6 pt-10 lg:pt-14">
        <ResultsHeader filters={filters} headline={headline} />
      </div>

      <div className={`mt-10 lg:mt-14 ${split ? 'lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-10' : ''}`}>
        {/* List */}
        <div className="flex min-w-0 flex-col gap-14">
          {/* `animate` (not `whileInView`) so cards re-added by a filter inherit "visible" */}
          <motion.ul
            ref={gridRef}
            variants={staggerContainer(STAGGER.base)}
            initial="hidden"
            animate={gridInView ? 'visible' : 'hidden'}
            // Beside the map: 1-up at `lg` (cards would be ~200px), 2-up from `xl`
            className={`grid gap-x-6 gap-y-14 sm:grid-cols-2 ${split ? 'lg:grid-cols-1 xl:grid-cols-2' : 'lg:grid-cols-3 lg:gap-x-10'}`}
          >
            <AnimatePresence mode="popLayout">
              {visible.map((stay) => (
                <motion.li
                  key={stay.id}
                  layout
                  variants={fadeUp}
                  exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)', transition: transition(DURATION.micro) }}
                  transition={{ layout: transition(DURATION.ui) }}
                >
                  <StayCard
                    stay={stay}
                    href={stayUrl(stay.id, filters)}
                    nights={nights}
                    sizes={
                      split
                        ? '(min-width: 1280px) 28vw, (min-width: 1024px) 55vw, (min-width: 640px) 50vw, 100vw'
                        : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                    }
                    onActiveChange={(active) => onCardActive(stay.id, active)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>

          <AnimatePresence mode="wait">
            {sorted.length === 0 ? (
              <EmptyState
                key="empty"
                outsideMap={searchAsMove && matched.length > 0}
                onShowAll={() => setSearchAsMove(false)}
                onReset={reset}
              />
            ) : (
              <motion.div key="pages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition(DURATION.micro)}>
                <Pagination page={current} total={pages} onChange={goToPage} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map */}
        {split && (
          <div className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-h)+1.5rem)] h-[calc(100svh-var(--header-h)-3rem)]">
              <Suspense fallback={<MapPlaceholder />}>
                <StayMap {...mapProps} className="h-full rounded-frame border border-line" />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {!isDesktop && (
        <MobileDock
          filterCount={refinementCount(filters)}
          onFilters={() => setSheet({ open: true, section: null })}
          onMap={() => setMobileMap(true)}
        />
      )}
      <MobileMap open={mobileMap && !isDesktop} onClose={closeMobileMap} mapProps={mapProps} />

      <AllFiltersSheet
        open={sheet.open}
        section={sheet.section}
        filters={filters}
        resultCount={inArea.length}
        onChange={patch}
        onReplace={(next) => onChange({ filters: next })}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
        sort={sort}
        onSortChange={(next) => onChange({ sort: next, page: 1 })}
      />
    </section>
  )
}

function MapPlaceholder() {
  return (
    <div className="relative h-full overflow-hidden rounded-frame border border-line bg-sand">
      <div aria-hidden className="grain absolute inset-0 opacity-60" />
    </div>
  )
}

function EmptyState({ outsideMap, onShowAll, onReset }: { outsideMap: boolean; onShowAll: () => void; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0 }}
      transition={transition(DURATION.ui, 0.15)}
      className="flex flex-col items-start gap-6 border-y border-line py-16 md:flex-row md:items-end md:justify-between"
    >
      <div className="flex flex-col gap-4">
        <MonoLabel className="text-graphite-600">(—) No matches</MonoLabel>
        <p className="max-w-xl text-h3 leading-[1.1] font-light tracking-[-0.03em]">
          {outsideMap ? (
            <>
              No stays in this part of the <span className="accent">map</span>.{' '}
              {typeset('Zoom out or move the map to see more.')}
            </>
          ) : (
            <>
              No stays match these <span className="accent">filters</span>.{' '}
              {typeset('Try other dates, fewer guests or a higher price limit.')}
            </>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={outsideMap ? onShowAll : onReset}
        className="inline-flex h-11 shrink-0 items-center rounded-full border border-line px-5 text-body transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk"
      >
        {outsideMap ? 'Show all results' : 'Reset filters'}
      </button>
    </motion.div>
  )
}

/**
 * Below `lg`: the dock's "Map" opens the map full-screen, with a "List" pill
 * to return. Portalled so the fixed layer escapes every ancestor.
 */
function MobileMap({
  open,
  onClose,
  mapProps,
}: {
  open: boolean
  onClose: () => void
  mapProps: StayMapProps
}) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const pill =
    'flex h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-body text-milk shadow-soft transition-colors duration-500 ease-cinematic hover:bg-graphite-800'

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-map"
            role="dialog"
            aria-modal="true"
            aria-label="Map of stays"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            exit={{ clipPath: 'inset(100% 0 0 0)' }}
            transition={transition(DURATION.ui)}
            className="fixed inset-0 z-50 bg-paper p-2"
          >
            <Suspense fallback={<MapPlaceholder />}>
              <StayMap {...mapProps} className="h-full rounded-frame border border-line">
                <button type="button" onClick={onClose} className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 ${pill}`}>
                  <List size={16} strokeWidth={1.5} />
                  List
                </button>
              </StayMap>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
