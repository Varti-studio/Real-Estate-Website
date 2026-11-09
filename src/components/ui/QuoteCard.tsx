import { Star } from 'lucide-react'
import type { StayReview } from '../../data/stayStories'
import { monthYear } from '../../lib/format'
import { Accented } from '../stay/text'

type QuoteCardProps = {
  review: Pick<StayReview, 'guest' | 'city' | 'stayed' | 'rating' | 'quote'>
  /** The frame: padding, border, background. Everything inside is shared. */
  className?: string
}

/**
 * One guest review, the same everywhere it appears ((06) Reflections, the stay
 * page's reviews and their sheet): an upright serif quote mark, the quote with
 * its `*accent*`, and a mono byline ("Sophia M., Milan" · ★ 9.4 / "Stayed Sept
 * 2026" · "Verified stay"). Callers only add the frame, and a photo above it.
 */
export function QuoteCard({ review, className = '' }: QuoteCardProps) {
  return (
    <figure className={`flex flex-1 flex-col ${className}`}>
      {/* A single glyph: `tracking-normal`, or the serif tracking pushes it off centre */}
      <span aria-hidden className="font-serif text-quote leading-none tracking-normal text-stone-500">
        “
      </span>
      <blockquote className="mt-2 mb-8 text-body leading-[1.55] text-ink">
        <p>
          <Accented text={review.quote} />
        </p>
      </blockquote>

      {/* Two rows that wrap as whole items, so a narrow card never breaks a name or date mid-line */}
      <figcaption className="mt-auto flex flex-col gap-1 border-t border-line pt-4 font-mono text-label leading-[1.6] tracking-label whitespace-nowrap text-graphite-600 uppercase tabular-nums">
        <span className="flex flex-wrap justify-between gap-x-4">
          <span className="text-ink">
            {review.guest}, {review.city}
          </span>
          <span className="inline-flex items-center gap-1 text-ink">
            <Star size={12} strokeWidth={1.5} className="fill-ink" aria-hidden />
            {review.rating.toFixed(1)}
            <span className="sr-only"> out of 10</span>
          </span>
        </span>
        <span className="flex flex-wrap justify-between gap-x-4">
          <span>Stayed {monthYear(review.stayed)}</span>
          <span>Verified stay</span>
        </span>
      </figcaption>
    </figure>
  )
}
