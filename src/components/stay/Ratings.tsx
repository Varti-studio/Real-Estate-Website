import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { StayReview, StayScores } from '../../data/stayStories'
import type { Stay } from '../../data/stays'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../../lib/motion'
import { reviewsFor } from '../../lib/reviews'
import type { Story } from '../../lib/stay'
import { typeset } from '../../lib/typography'
import { QuoteCard } from '../ui/QuoteCard'
import { Sheet } from '../ui/Sheet'
import { Pagination } from '../catalog/Pagination'
import { MoreButton, StaySection } from './StaySection'

/** Reviews per page in the sheet. */
const PER_PAGE = 10

const METRICS: { key: keyof StayScores; label: string }[] = [
  { key: 'silence', label: 'Privacy' },
  { key: 'design', label: 'Design' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location', label: 'Location' },
]

/** The rating, four sub-scores as hairline bars, and the first two reviews. */
export function Ratings({ stay, story }: { stay: Stay; story: Story }) {
  const [open, setOpen] = useState(false)
  const bars = useRef<HTMLDListElement>(null)
  const barsInView = useInView(bars, inView)
  const { reviews } = story

  return (
    <StaySection
      id="reviews"
      index="(05)"
      title={
        <span className="inline-flex items-center gap-3 tabular-nums">
          <Star size={24} strokeWidth={1.25} className="fill-ink" aria-hidden />
          {stay.rating.toFixed(1)}
          <span aria-hidden className="text-stone-500">
            ·
          </span>
          {stay.reviews} reviews
        </span>
      }
      meta="Scores out of 10, from verified stays only"
    >
      <dl ref={bars} className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
        {METRICS.map(({ key, label }, i) => {
          const score = story.scores[key]
          return (
            <div key={key} className="grid grid-cols-[7rem_1fr_auto] items-center gap-4">
              <dt className="text-body text-graphite-600">{label}</dt>
              {/* 1px track, 2px fill; the fill grows with scaleX so only transform animates */}
              <div aria-hidden className="relative flex h-0.5 items-center">
                <span className="h-px w-full bg-line" />
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: barsInView ? score / 10 : 0 }}
                  transition={transition(DURATION.image, i * STAGGER.base)}
                  className="absolute inset-0 origin-left bg-ink"
                />
              </div>
              <dd className="w-8 text-right font-mono text-body tabular-nums">{score.toFixed(1)}</dd>
            </div>
          )
        })}
      </dl>

      {reviews.length > 0 ? (
        <>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {reviews.slice(0, 2).map((review) => (
              <li key={review.guest} className="flex">
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
          {stay.reviews > 2 && (
            <MoreButton onClick={() => setOpen(true)}>{typeset(`Show all ${stay.reviews} reviews`)}</MoreButton>
          )}
        </>
      ) : (
        <p className="mt-12 font-mono text-label text-graphite-600">(—) No written reviews yet</p>
      )}

      <ReviewsSheet open={open} onClose={() => setOpen(false)} stay={stay} story={story} />
    </StaySection>
  )
}

/**
 * Every review, newest first after the written ones, 10 to a page. The
 * pagination sits in the sheet's footer, so it is always in reach; a page
 * change returns to the top of the list.
 */
function ReviewsSheet({ open, onClose, stay, story }: { open: boolean; onClose: () => void; stay: Stay; story: Story }) {
  const all = useMemo(() => reviewsFor(stay, story), [stay, story])
  const [page, setPage] = useState(1)
  const body = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE))
  const from = (page - 1) * PER_PAGE

  // Each opening starts on page 1
  useEffect(() => {
    if (open) setPage(1)
  }, [open])

  const goTo = (next: number) => {
    setPage(next)
    body.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reviews"
      count={all.length}
      onOpened={(el) => {
        body.current = el
      }}
      footer={
        pages > 1 ? <Pagination page={page} total={pages} onChange={goTo} layoutId="reviews-page" bare compact /> : undefined
      }
    >
      <motion.p variants={fadeUp} aria-live="polite" className="pt-6 font-mono text-label text-graphite-600 tabular-nums">
        {typeset(`Reviews ${from + 1}–${Math.min(from + PER_PAGE, all.length)} of ${all.length}`)}
      </motion.p>
      {/* Keyed by page: each page's cards fade up in turn */}
      <motion.ul
        key={page}
        variants={staggerContainer(STAGGER.tight)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 py-6"
      >
        {all.slice(from, from + PER_PAGE).map((review, i) => (
          <motion.li key={`${review.guest}-${from + i}`} variants={fadeUp} className="flex">
            <ReviewCard review={review} />
          </motion.li>
        ))}
      </motion.ul>
    </Sheet>
  )
}

/** A review in the stay's own frame: a milk card with a hairline border. */
function ReviewCard({ review }: { review: StayReview }) {
  return <QuoteCard review={review} className="w-full rounded-card border border-line bg-milk p-6" />
}
