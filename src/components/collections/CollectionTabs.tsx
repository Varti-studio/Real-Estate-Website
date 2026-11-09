import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Collection, CollectionId } from '../../data/collections'
import { pad } from '../../lib/format'
import { DURATION, EASE, STAGGER, fadeUp, inView, staggerContainer } from '../../lib/motion'

type CollectionTabsProps = {
  items: { collection: Collection; count: number }[]
  value: CollectionId
  onSelect: (id: CollectionId) => void
  /** Called when the already-active tile is pressed again. */
  onOpen: (id: CollectionId) => void
}

/**
 * Vertical tile switcher. Pressing a tile shows its stays in the gallery;
 * pressing the active tile opens the collection in the catalog.
 */
export function CollectionTabs({ items, value, onSelect, onOpen }: CollectionTabsProps) {
  return (
    <motion.ul
      variants={staggerContainer(STAGGER.tight)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      aria-label="Collections"
      className="flex flex-col gap-2"
    >
      {items.map(({ collection, count }, i) => {
        const active = collection.id === value
        return (
          <motion.li key={collection.id} variants={fadeUp}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => (active ? onOpen(collection.id) : onSelect(collection.id))}
              className={`group relative flex h-[76px] w-full items-center gap-5 rounded-full border pr-2 pl-6 text-left transition-colors duration-500 ease-cinematic ${
                active ? 'border-sand' : 'border-line hover:bg-milk'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="collection-tab"
                  aria-hidden
                  className="absolute -inset-px rounded-full bg-sand"
                  transition={{ duration: DURATION.ui, ease: EASE }}
                />
              )}
              <span
                aria-hidden
                className={`relative font-mono text-label tabular-nums transition-colors duration-500 ease-cinematic ${
                  active ? 'text-accent' : 'text-graphite-500 group-hover:text-ink'
                }`}
              >
                {pad(i + 1)}
              </span>
              <span className="relative flex-1 truncate text-[26px] leading-[1.15] font-light tracking-[-0.025em] text-ink">
                {collection.title}
              </span>
              <span
                aria-hidden
                className={`relative grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500 ease-cinematic lg:size-12 ${
                  active ? 'bg-ink text-milk' : 'border border-line text-graphite-600 group-hover:border-ink group-hover:text-ink'
                }`}
              >
                <ArrowRight
                  size={16}
                  strokeWidth={1.5}
                  className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-focus-visible:translate-x-1"
                />
              </span>
              <span className="sr-only">
                {`, ${count} ${count === 1 ? 'stay' : 'stays'}`}
                {active && ', open in catalog'}
              </span>
            </button>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
