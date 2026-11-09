import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { FilterChip } from '../../lib/filters'
import { DURATION, transition } from '../../lib/motion'

type AppliedFiltersProps = {
  chips: FilterChip[]
  onRemove: (chip: FilterChip) => void
  onClearAll: () => void
}

/** Removable tags for every active filter, one per value ("Mirror house ×", "Sauna ×"). */
export function AppliedFilters({ chips, onRemove, onClearAll }: AppliedFiltersProps) {
  return (
    // min-h keeps the row's height when the last tag leaves, so the page doesn't jump
    <motion.div layout className="flex min-h-8 flex-wrap items-center gap-2" aria-label="Applied filters" role="group">
      <AnimatePresence mode="popLayout" initial={false}>
        {chips.length === 0 && (
          <motion.span
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition(DURATION.micro)}
            className="eyebrow text-graphite-600"
          >
            (—) No filters applied
          </motion.span>
        )}
        {chips.map((chip) => (
          <motion.button
            layout
            key={chip.id}
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Remove filter: ${chip.label}`}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            transition={transition(DURATION.micro)}
            className="group inline-flex h-8 items-center gap-2 rounded-full border border-line bg-milk pr-2 pl-3 font-mono text-label tracking-label text-ink uppercase transition-colors duration-500 ease-cinematic hover:border-ink focus-visible:border-ink"
          >
            {chip.label}
            <span className="grid size-4 place-items-center rounded-full transition-colors duration-500 ease-cinematic group-hover:bg-ink group-hover:text-milk group-focus-visible:bg-ink group-focus-visible:text-milk">
              <X size={10} strokeWidth={1.5} />
            </span>
          </motion.button>
        ))}
        {chips.length > 0 && (
          <motion.button
            layout
            key="clear-all"
            type="button"
            onClick={onClearAll}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition(DURATION.micro)}
            className="ml-2 font-mono text-label tracking-label text-graphite-600 uppercase underline-offset-4 transition-colors duration-500 ease-cinematic hover:text-ink hover:underline focus-visible:underline"
          >
            Clear all
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
