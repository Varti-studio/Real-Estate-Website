import { AnimatePresence, motion } from 'framer-motion'
import { collectionById } from '../../data/collections'
import { stays as allStays, type Stay } from '../../data/stays'
import { formatRange, nightsBetween } from '../../lib/dates'
import { buildDestinations, guestCount, type Filters } from '../../lib/filters'
import { PRICE } from '../../data/copy'
import { DURATION, fadeUp, lineReveal, staggerContainer, STAGGER, transition } from '../../lib/motion'
import { typeset } from '../../lib/typography'

const destinations = buildDestinations(allStays)

export interface Headline {
  /** "14 stays", "1 stay", "No stays". */
  count: string
  /** "in", "for", "across", "match". */
  joiner: string
  /** The serif accent: a place, collection, query or "9 countries". */
  scope: string
  lead?: string
}

/** Heading for the current results, e.g. "3 stays in *Lapland, Finland*". */
export function resultsHeadline(f: Filters, results: Stay[]): Headline {
  const n = results.length
  const count = n ? `${n} ${n === 1 ? 'stay' : 'stays'}` : 'No stays'
  const collection = collectionById(f.collection)
  if (collection) return { count, joiner: 'in', scope: collection.title, lead: collection.description }

  const q = f.query.trim()
  if (q) {
    const place = destinations.find((d) => d.query.toLowerCase() === q.toLowerCase())
    return place ? { count, joiner: 'in', scope: place.title } : { count, joiner: 'for', scope: `“${q}”` }
  }

  if (!n) return { count, joiner: 'match', scope: 'these filters' }
  const countries = [...new Set(results.map((s) => s.country))]
  if (countries.length === 1) return { count, joiner: 'in', scope: countries[0] }
  return {
    count,
    joiner: 'across',
    scope: `${countries.length} countries`,
    lead: 'We have visited and stayed in every home here.',
  }
}

export const headlineText = (h: Headline) => `${h.count} ${h.joiner} ${h.scope}`

/** "12–17 Oct · 5 nights · 2 guests · Prices per night, before taxes". */
function metaLine(f: Filters) {
  const nights = nightsBetween(f.checkIn, f.checkOut)
  const guests = guestCount(f)
  return [
    nights ? `${formatRange(f.checkIn, f.checkOut)} · ${nights} ${nights === 1 ? 'night' : 'nights'}` : 'Any week',
    guests ? `${guests} ${guests === 1 ? 'guest' : 'guests'}` : 'Any guests',
    `Prices ${PRICE.unit}`,
  ].map(typeset)
}

export function ResultsHeader({ filters, headline }: { filters: Filters; headline: Headline }) {
  const { count, joiner, scope, lead } = headline

  return (
    <motion.div
      variants={staggerContainer(STAGGER.base)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <h1 className="text-h2 font-light" aria-live="polite">
          <span className="block overflow-hidden pb-[0.08em]">
            {/* Re-reveals when the scope changes; the count alone just rolls */}
            <motion.span key={`${joiner}|${scope}`} variants={lineReveal} initial="hidden" animate="visible" className="block">
              <span className="relative inline-block">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: '40%', filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: '-40%', filter: 'blur(6px)' }}
                    transition={transition(DURATION.ui)}
                    className="inline-block"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </span>{' '}
              {joiner} <span className="accent">{scope}</span>
            </motion.span>
          </span>
        </h1>
        <motion.p variants={fadeUp} className="font-mono text-label leading-[1.8] tracking-label text-graphite-600 uppercase tabular-nums">
          {metaLine(filters).join(' · ')}
        </motion.p>
      </div>

      {lead && (
        <motion.p variants={fadeUp} className="max-w-sm text-body leading-[1.55] text-graphite-600 lg:text-right">
          {typeset(lead)}
        </motion.p>
      )}
    </motion.div>
  )
}
