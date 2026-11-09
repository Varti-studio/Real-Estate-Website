import { useEffect, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Stay } from '../data/stays'
import { PRICE } from '../data/copy'
import { priceFormat, roughCoordinates } from '../lib/format'
import { DURATION, transition } from '../lib/motion'
import { NBSP, typeset } from '../lib/typography'
import { linkClick } from '../lib/router'
import { stayUrl } from '../lib/stay'
import { ImageWithFallback } from './ui/ImageWithFallback'
import { Tag } from './ui/Tag'

const zoom: Variants = {
  rest: { scale: 1, transition: transition(DURATION.image) },
  hover: { scale: 1.03, transition: transition(DURATION.image) },
}

const shade: Variants = {
  rest: { opacity: 0, transition: transition(DURATION.ui) },
  hover: { opacity: 1, transition: transition(DURATION.ui) },
}

const details: Variants = {
  rest: { opacity: 0, y: 16, filter: 'blur(4px)', transition: transition(DURATION.micro) },
  hover: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transition(DURATION.ui, 0.05) },
}

type StayCardProps = {
  stay: Stay
  nights?: number
  /** Responsive `sizes` for the photo; defaults to the 3-up grid. */
  sizes?: string
  /** Hover or keyboard focus, e.g. to highlight the stay's map pin. */
  onActiveChange?: (active: boolean) => void
  /** Extra classes on the 4:5 photo, e.g. a viewport-based height cap. */
  photoClassName?: string
  /** The stay's page; the catalogue passes one that carries the visitor's dates and guests. */
  href?: string
  /** The N° index; off where cards don't run in catalogue order (the home page). */
  showIndex?: boolean
}

export function StayCard({
  stay,
  nights = 0,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  onActiveChange,
  photoClassName = '',
  href = stayUrl(stay.id),
  showIndex = true,
}: StayCardProps) {
  // Tracked apart so a pointer leaving doesn't cancel keyboard focus, and vice versa
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused

  useEffect(() => {
    onActiveChange?.(active)
  }, [active, onActiveChange])

  return (
    <motion.a
      href={href}
      onClick={(e) => linkClick(e, href)}
      initial="rest"
      animate={active ? 'hover' : 'rest'}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="group @container block focus-visible:outline-none"
      aria-label={`${stay.name}, ${stay.type} in ${stay.location}, ${stay.country}. ${priceFormat.format(stay.pricePerNight)} ${PRICE.unit}.`}
    >
      {/* Photo */}
      <div className={`relative aspect-[4/5] overflow-hidden rounded-card group-focus-visible:ring-1 group-focus-visible:ring-ink group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-paper ${photoClassName}`}>
        <motion.div variants={zoom} className="absolute inset-0 will-change-transform">
          <ImageWithFallback
            src={stay.image}
            alt={stay.alt}
            loading="lazy"
            sizes={sizes}
            wrapperClassName="h-full w-full"
          />
        </motion.div>

        <motion.div
          variants={shade}
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent"
        />

        {/* Top scrim keeps the index legible on bright skies */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/35 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <Tag tone="photo">
            {stay.type}
          </Tag>
          {showIndex && (
            <span className="font-mono text-label leading-7 tracking-label text-milk tabular-nums">
              {stay.index}
            </span>
          )}
        </div>

        <motion.div
          variants={details}
          className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-milk"
        >
          <div className="flex flex-col gap-2">
            <span className="font-mono text-label tracking-label text-milk/70 uppercase tabular-nums">
              {roughCoordinates(stay.coordinates)}
            </span>
            <p className="max-w-[26ch] text-body leading-snug">{typeset(stay.excerpt)}</p>
            <span className="font-mono text-label tracking-label text-milk/60 uppercase">
              {typeset(`Designed by ${stay.architect}`)}
            </span>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-milk text-ink">
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </span>
        </motion.div>
      </div>

      {/* Caption */}
      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-title font-light tracking-[-0.03em]">{stay.name}</h3>
          <p className="font-mono text-body tabular-nums">
            {priceFormat.format(stay.pricePerNight)}
            <span className="text-stone-500">{`${NBSP}/${NBSP}night`}</span>
          </p>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4">
          <p className="text-body text-graphite-600">
            {stay.location}, {stay.country}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            {nights > 0 && (
              <motion.p
                key={nights}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transition(DURATION.micro)}
                className="font-mono text-label text-stone-500 tabular-nums"
              >
                {priceFormat.format(stay.pricePerNight * nights)} · {nights}
                {`${NBSP}${nights === 1 ? 'night' : 'nights'}`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Narrow cards (the mobile featured row) tighten the meta so "184 m²" stays on one line */}
        <dl className="mt-5 grid grid-cols-3 border-y border-line font-mono text-label tracking-label uppercase tabular-nums @max-[20rem]:tracking-[0.06em]">
          <Meta label="Guests" value={String(stay.guests)} />
          <Meta label="Beds" value={String(stay.beds)} className="border-x border-line" />
          <Meta label="Area" value={`${stay.area}${NBSP}m²`} />
        </dl>
      </div>
    </motion.a>
  )
}

function Meta({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-3 first:pl-0 last:pr-0 @max-[20rem]:px-2 ${className}`}>
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}
