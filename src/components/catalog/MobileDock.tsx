import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react'
import { DURATION, transition } from '../../lib/motion'
import { openMobileSearch } from '../search/MobileSearch'

type MobileDockProps = {
  /** Applied refinements, shown as a badge on Filters. */
  filterCount: number
  onFilters: () => void
  onMap: () => void
}

const item =
  'flex h-12 items-center justify-center gap-2 rounded-full text-body tracking-[-0.01em] text-milk transition-colors duration-500 ease-cinematic hover:bg-graphite-800 focus-visible:outline-milk focus-visible:outline-offset-[-4px]'

/**
 * Below `lg`: the catalogue's controls in one floating `ink` dock at the bottom of
 * the screen (Search · Filters · Map), so the list starts right under the
 * heading. Portalled so `position: fixed` escapes every ancestor.
 */
export function MobileDock({ filterCount, onFilters, onMap }: MobileDockProps) {
  return createPortal(
    <motion.nav
      aria-label="Search tools"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(DURATION.ui, 0.3)}
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full bg-ink p-1 shadow-soft lg:hidden"
    >
      <button type="button" onClick={openMobileSearch} aria-label="Search" className={`${item} w-12`}>
        <Search size={18} strokeWidth={1.5} />
      </button>

      <span aria-hidden className="h-6 w-px shrink-0 bg-milk/15" />

      <button
        type="button"
        onClick={onFilters}
        aria-haspopup="dialog"
        aria-label={filterCount ? `Filters, ${filterCount} applied` : 'Filters'}
        className={`${item} px-4`}
      >
        <SlidersHorizontal size={16} strokeWidth={1.5} />
        Filters
        <AnimatePresence initial={false}>
          {filterCount > 0 && (
            <motion.span
              key="badge"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={transition(DURATION.micro)}
              className="grid size-5 place-items-center rounded-full bg-milk font-mono text-label tracking-normal text-ink tabular-nums"
            >
              {filterCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <span aria-hidden className="h-6 w-px shrink-0 bg-milk/15" />

      <button type="button" onClick={onMap} aria-haspopup="dialog" className={`${item} px-4`}>
        <MapIcon size={16} strokeWidth={1.5} />
        Map
      </button>
    </motion.nav>,
    document.body,
  )
}
