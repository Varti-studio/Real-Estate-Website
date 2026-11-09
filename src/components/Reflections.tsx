import { useState, type FocusEvent } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { reflections, type Reflection } from '../data/reflections'
import { stays, type Stay } from '../data/stays'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../lib/motion'
import { Link } from '../lib/router'
import { stayUrl } from '../lib/stay'
import { typeset } from '../lib/typography'
import { useScrollRow } from '../lib/useScrollRow'
import { accent } from './stay/text'
import { ImageWithFallback } from './ui/ImageWithFallback'
import { MonoLabel } from './ui/MonoLabel'
import { QuoteCard } from './ui/QuoteCard'
import { RowControls } from './ui/RowControls'
import { Tag } from './ui/Tag'

/** Each review with the stay it describes. A review whose stay is missing is not shown. */
const ITEMS = reflections.flatMap((reflection) => {
  const stay = stays.find((s) => s.id === reflection.stayId)
  return stay ? [{ reflection, stay }] : []
})

/**
 * Card width: ~1.15 cards on mobile, ~1.6 on tablet, ~3.2 on desktop, so the next story always peeks.
 * From `lg` the 120px is the three 40px gaps before the peeking card.
 */
const CARD = 'flex w-[86%] shrink-0 snap-start sm:w-[calc((100%-24px)/1.6)] lg:w-[calc((100%-120px)/3.2)]'

/** Photo drift on hover. */
const zoom: Variants = {
  rest: { scale: 1, transition: transition(DURATION.image) },
  hover: { scale: 1.03, transition: transition(DURATION.image) },
}

/** (06) Reflections — guests on what stayed with them, as a horizontal scroll-snap row. */
export function Reflections() {
  const { ref: track, state: scroll, page, reveal } = useScrollRow<HTMLOListElement>()
  const trackInView = useInView(track, inView)

  return (
    <section id="reflections" aria-labelledby="reflections-title" className="container-x scroll-mt-6 pb-24 lg:pb-40">
      <motion.header
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:items-end lg:gap-10"
      >
        <div className="lg:col-span-8">
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <MonoLabel className="text-accent">(06)</MonoLabel>
            <MonoLabel className="text-ink">Reflections</MonoLabel>
          </motion.div>

          <motion.h2
            id="reflections-title"
            variants={fadeUp}
            className="mt-8 max-w-[16ch] text-h2 font-light lg:mt-12"
          >
            What guests {accent('say')}
          </motion.h2>
        </div>

        <motion.p
          variants={fadeUp}
          className="max-w-sm text-body leading-[1.55] text-graphite-600 lg:col-span-4 lg:justify-self-end lg:text-right"
        >
          {typeset('Written after verified stays and rated out of 10. Each photo opens the home.')}
        </motion.p>
      </motion.header>

      {/* `animate` (not `whileInView`) so every card shares the list's reveal. `py-2` leaves room
          for the 4px hover lift, which the row's overflow would otherwise clip. */}
      <motion.ol
        ref={track}
        id="reflections-track"
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        animate={trackInView ? 'visible' : 'hidden'}
        aria-label="Guest stories"
        className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:-mx-6 md:scroll-px-6 md:px-6 lg:mx-0 lg:mt-18 lg:scroll-px-0 lg:gap-10 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {ITEMS.map(({ reflection, stay }) => (
          <ReflectionCard key={reflection.id} reflection={reflection} stay={stay} onFocus={reveal} />
        ))}
      </motion.ol>

      <RowControls controls="reflections-track" noun="stories" state={scroll} onPage={page} className="mt-10" />
    </section>
  )
}

/** A story card: the stay's photo, the guest's words, and who wrote them. */
function ReflectionCard({
  reflection,
  stay,
  onFocus,
}: {
  reflection: Reflection
  stay: Stay
  onFocus: (e: FocusEvent<HTMLElement>) => void
}) {
  // Hover as state, not `whileHover`, so the lift doesn't fight the card's reveal variants.
  // Tracked apart so a pointer leaving doesn't cancel keyboard focus, and vice versa.
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused

  return (
    <motion.li
      variants={fadeUp}
      onFocus={onFocus}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={CARD}
    >
      <motion.article
        initial={false}
        animate={{ y: active ? -4 : 0 }}
        transition={transition(DURATION.ui)}
        className={`flex w-full flex-col rounded-frame border bg-milk p-2 transition-colors duration-500 ease-cinematic ${
          active ? 'border-stone-500' : 'border-line'
        }`}
      >
        <Link
          to={stayUrl(stay.id)}
          onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
          aria-label={`View ${stay.name}, ${stay.location}, ${stay.country}`}
          className="relative isolate block aspect-video overflow-hidden rounded-card bg-sand"
        >
          <motion.div
            variants={zoom}
            initial={false}
            animate={active ? 'hover' : 'rest'}
            className="absolute inset-0 will-change-transform"
          >
            <ImageWithFallback
              src={stay.image}
              alt={stay.alt}
              loading="lazy"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 62vw, 86vw"
              style={{ objectPosition: stay.focus }}
              wrapperClassName="h-full w-full"
            />
          </motion.div>
          <Tag tone="photo" className="absolute top-3 left-3">
            {stay.name} · {stay.location}
          </Tag>
        </Link>

        <QuoteCard review={reflection} className="px-4 pt-6 pb-4 lg:px-6 lg:pb-6" />
      </motion.article>
    </motion.li>
  )
}
