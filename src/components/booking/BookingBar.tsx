import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, transition } from '../../lib/motion'
import { goTo } from '../../lib/router'
import { typeset } from '../../lib/typography'
import { hostName, type Trip } from './trip'

const LINK = 'text-ink underline underline-offset-4 decoration-line transition-colors duration-500 ease-cinematic hover:decoration-ink focus-visible:decoration-ink'

/**
 * Pinned to the bottom of the screen while the page scrolls, resting above the
 * footer at the end (last in `<main>`, like the stay page's ReserveBar). `note`
 * floats above it (the Trips placeholder), so it is seen wherever it was asked for.
 */
export function BookingBar({
  trip,
  note,
  onTrips,
  onMessage,
}: {
  trip: Trip
  note: string
  onTrips: () => void
  onMessage: () => void
}) {
  const host = hostName(trip.story)

  return (
    <div className="sticky bottom-0 z-30 border-t border-line bg-milk/95 backdrop-blur-md print:hidden">
      <p aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-full mb-4 flex justify-center px-4">
        <AnimatePresence>
          {note && (
            <motion.span
              key={note}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={transition(DURATION.ui)}
              className="max-w-md rounded-card bg-ink px-5 py-3 text-center text-body leading-[1.55] text-milk shadow-soft"
            >
              {typeset(note)}
            </motion.span>
          )}
        </AnimatePresence>
      </p>
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <p className="hidden text-body text-graphite-600 md:block">
          Questions about this booking?{' '}
          <button type="button" onClick={onMessage} aria-haspopup="dialog" className={LINK}>
            Message {host}
          </button>{' '}
          or visit the{' '}
          <a
            href="/#faq"
            onClick={(e) => {
              e.preventDefault()
              goTo('/#faq')
            }}
            className={LINK}
          >
            Help centre
          </a>
          .
        </p>
        <div className="flex flex-1 items-center gap-3 md:flex-none">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line px-5 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk focus-visible:border-ink md:flex-none"
          >
            Print<span className="hidden sm:inline">&nbsp;confirmation</span>
          </button>
          <button
            type="button"
            onClick={onTrips}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-ink px-5 text-body tracking-[-0.01em] text-milk transition-colors duration-500 ease-cinematic hover:bg-graphite-800 focus-visible:bg-graphite-800 md:flex-none"
          >
            Go to Trips
          </button>
        </div>
      </div>
    </div>
  )
}
