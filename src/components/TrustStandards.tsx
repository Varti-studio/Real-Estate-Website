import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { PRICE } from '../data/copy'
import { stays, unsplash, type StayDetail } from '../data/stays'
import { pad } from '../lib/format'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../lib/motion'
import { NBSP, typeset } from '../lib/typography'
import { ImageWithFallback } from './ui/ImageWithFallback'
import { MonoLabel } from './ui/MonoLabel'

const accent = (word: string) => (
  <span className="accent">{word}</span>
)

/** A stay's close-up, or its main photo when it has none. */
const photoOf = (id: string): StayDetail | undefined => {
  const stay = stays.find((s) => s.id === id)
  if (!stay) return undefined
  return stay.detail ?? { image: stay.image, alt: stay.alt, caption: stay.name }
}

/** What we check before a home is listed. Each standard is illustrated by a material close-up. */
const STANDARDS: { title: string; body: string; photo?: StayDetail }[] = [
  {
    title: 'Inspected in person',
    body: "We visit every home and stay the overnight. On the visit we check the structure, heating, power and water, the access road in, and whether the house still matches the architect's drawings.",
    photo: photoOf('casa-socalco'),
  },
  {
    title: 'A named host for every home',
    body: 'Each owner signs a direct agreement with Solum. The listing gives the host’s name, and your booking confirmation gives their phone number.',
    photo: photoOf('kiefer-haus'),
  },
  {
    title: 'Prices without surprises',
    body: PRICE.summary,
    photo: photoOf('dar-ocre'),
  },
]

/** The panel's own photo, not a stay's, so it doesn't repeat a stay card elsewhere on the page. */
const PHOTO = {
  image: unsplash('1659720879268-818dea77efaa', 1600),
  alt: 'A timber and glass house raised on a wooded hillside at dusk',
}

/** Photo drift on hover. */
const zoom: Variants = {
  rest: { scale: 1, transition: transition(DURATION.image) },
  hover: { scale: 1.03, transition: transition(DURATION.image) },
}

/** (05) Trust & standards — why the stays can be booked without a second thought. */
export function TrustStandards() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="container-x scroll-mt-6 pb-24 lg:pb-40">
      {/* From lg the panel stretches to the right column, so it ends on the accordion's closing hairline */}
      <div className="grid gap-12 border-t border-line pt-8 lg:grid-cols-12 lg:gap-x-10">
        <TrustPanel />

        <div className="lg:col-span-7">
          <motion.header
            variants={staggerContainer(STAGGER.base)}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <MonoLabel className="text-accent">(05)</MonoLabel>
              <MonoLabel className="text-ink">Trust &amp; standards</MonoLabel>
            </motion.div>

            <motion.h2 id="trust-title" variants={fadeUp} className="mt-8 max-w-[16ch] text-h2 font-light lg:mt-12">
              What we check before a home is {accent('listed')}
            </motion.h2>
          </motion.header>

          <StandardsAccordion />
        </div>
      </div>
    </section>
  )
}

/** A dark framed panel over its own house photo, with one line of copy at its foot. */
function TrustPanel() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  // Hover as state, so the zoom doesn't fight the panel's own reveal variants
  const [hovered, setHovered] = useState(false)

  // The photo settles from a slight zoom as the panel travels through the viewport
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  return (
    <motion.figure
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-frame bg-ink p-6 text-milk sm:aspect-[16/10] md:p-8 lg:col-span-5 lg:aspect-auto lg:p-10"
    >
      <motion.div
        style={{ scale: reduceMotion ? 1 : scrollScale }}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <motion.div
          variants={zoom}
          initial={false}
          animate={hovered ? 'hover' : 'rest'}
          className="h-full w-full will-change-transform"
        >
          <ImageWithFallback
            src={PHOTO.image}
            alt={PHOTO.alt}
            loading="lazy"
            sizes="(min-width: 1024px) 40vw, 100vw"
            wrapperClassName="h-full w-full bg-graphite-900"
          />
        </motion.div>
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <figcaption className="max-w-[22ch] text-title leading-[1.1] font-light tracking-[-0.02em] lg:text-h3">
        Every home is checked in person before it goes{NBSP}{accent('live')}.
      </figcaption>
    </motion.figure>
  )
}

/** Three standards; one is always open. Rows switch on click so nothing reflows under the cursor. */
function StandardsAccordion() {
  const [active, setActive] = useState(0)

  return (
    <motion.ol
      variants={staggerContainer(STAGGER.base)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      className="mt-12 border-b border-line lg:mt-16"
    >
      {STANDARDS.map((item, i) => {
        const open = i === active
        const headerId = `standard-${i}-header`
        const panelId = `standard-${i}-panel`

        return (
          <motion.li
            key={item.title}
            variants={fadeUp}
            className={`group border-t transition-colors duration-500 ease-cinematic ${
              open ? 'border-line' : 'border-line hover:border-stone-500 has-[:focus-visible]:border-stone-500'
            }`}
          >
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => setActive(i)}
                className={`flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-500 ease-cinematic lg:py-8 ${
                  open ? 'cursor-default text-ink' : 'text-graphite-600 hover:text-ink focus-visible:text-ink'
                }`}
              >
                <span className="text-title leading-[1.2] font-normal tracking-[-0.02em]">{item.title}</span>
                <span
                  className={`font-mono text-label tabular-nums transition-transform duration-500 ease-cinematic ${
                    open ? 'text-ink' : 'text-stone-500 group-hover:-translate-x-1 group-has-[:focus-visible]:-translate-x-1'
                  }`}
                >
                  {pad(i + 1)}
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {open && (
                // Accordion panels are the one place height animates (see the motion notes in the design system)
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: transition(DURATION.ui) }}
                  exit={{ height: 0, opacity: 0, transition: transition(DURATION.ui) }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: 8, opacity: 0, filter: 'blur(6px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)', transition: transition(DURATION.ui, STAGGER.base) }}
                    exit={{ opacity: 0, transition: transition(DURATION.micro) }}
                    className="flex items-start justify-between gap-6 pb-8 lg:pb-10"
                  >
                    <p className="max-w-[44ch] text-body leading-[1.55] text-graphite-600">{typeset(item.body)}</p>

                    {item.photo && (
                      <figure className="hidden shrink-0 sm:block">
                        <div className="aspect-[4/3] w-40 overflow-hidden rounded-card">
                          <motion.div
                            initial={{ scale: 1.03 }}
                            animate={{ scale: 1, transition: transition(DURATION.image) }}
                            className="h-full w-full"
                          >
                            <ImageWithFallback
                              src={item.photo.image}
                              alt={item.photo.alt}
                              loading="lazy"
                              sizes="160px"
                              wrapperClassName="h-full w-full"
                            />
                          </motion.div>
                        </div>
                        <figcaption className="mt-2 max-w-40 font-mono text-label tracking-label text-graphite-600 uppercase">
                          {typeset(item.photo.caption)}
                        </figcaption>
                      </figure>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}
