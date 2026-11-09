import { useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { faq } from '../data/faq'
import { stays } from '../data/stays'
import { pad } from '../lib/format'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../lib/motion'
import { typeset } from '../lib/typography'
import { ImageWithFallback } from './ui/ImageWithFallback'
import { MonoLabel } from './ui/MonoLabel'

const accent = (word: string) => (
  <span className="accent">{word}</span>
)

/** The card is framed around this stay: a timber villa with its windows lit at dusk. */
const PHOTO = stays.find((s) => s.id === 'kiefer-haus') ?? stays[0]

/** Photo drift on hover. */
const zoom: Variants = {
  rest: { scale: 1, transition: transition(DURATION.image) },
  hover: { scale: 1.03, transition: transition(DURATION.image) },
}

/** (07) FAQ — the practical questions, answered before booking. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="container-x scroll-mt-6 pb-24 lg:pb-40">
      <div className="grid gap-12 border-t border-line pt-8 lg:grid-cols-12 lg:gap-x-10">
        <motion.header
          variants={staggerContainer(STAGGER.base)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="lg:col-span-12"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <MonoLabel className="text-accent">(07)</MonoLabel>
            <MonoLabel className="text-ink">Questions</MonoLabel>
          </motion.div>

          <motion.h2 id="faq-title" variants={fadeUp} className="mt-8 max-w-[16ch] text-h2 font-light lg:mt-12">
            Frequently asked {accent('questions')}
          </motion.h2>
        </motion.header>

        <FaqAccordion />
        <FaqPhoto />
      </div>
    </section>
  )
}

/** The questions; at most one is open. Rows toggle on click so nothing reflows under the cursor. */
function FaqAccordion() {
  const [active, setActive] = useState<number | null>(0)

  return (
    <motion.ol
      variants={staggerContainer(STAGGER.base)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      className="lg:col-span-7"
    >
      {faq.map((item, i) => {
        const open = i === active
        const headerId = `faq-${i}-header`
        const panelId = `faq-${i}-panel`

        return (
          <motion.li
            key={item.question}
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
                onClick={() => setActive(open ? null : i)}
                className={`flex w-full items-center gap-6 py-6 text-left transition-colors duration-500 ease-cinematic lg:py-8 ${
                  open ? 'text-ink' : 'text-graphite-600 hover:text-ink focus-visible:text-ink'
                }`}
              >
                <span
                  aria-hidden
                  className={`w-8 shrink-0 font-mono text-label tabular-nums transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-has-[:focus-visible]:translate-x-1 ${
                    open ? 'text-ink' : 'text-stone-500'
                  }`}
                >
                  {pad(i + 1)}
                </span>
                <span className="flex-1 text-title leading-[1.3] font-normal tracking-[-0.02em]">{typeset(item.question)}</span>
                <PlusMinus open={open} />
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
                  <motion.p
                    initial={{ y: 8, opacity: 0, filter: 'blur(6px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)', transition: transition(DURATION.ui, STAGGER.base) }}
                    exit={{ opacity: 0, transition: transition(DURATION.micro) }}
                    className="max-w-[52ch] pb-6 pl-14 text-body leading-[1.55] text-graphite-600 lg:pb-8"
                  >
                    {typeset(item.answer)}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}

/** Two hairline strokes: the vertical one rotates down onto the horizontal, turning + into —. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative size-4 shrink-0">
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
      <motion.span
        initial={false}
        animate={{ rotate: open ? 90 : 0 }}
        transition={transition(DURATION.ui)}
        className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current"
      />
    </span>
  )
}

/**
 * The visual anchor: the villa at dusk. From `lg` it has no aspect ratio and stretches to the
 * accordion's row, so its top meets the first question and its bottom the last.
 */
function FaqPhoto() {
  // Hover as state, so the zoom doesn't fight the card's own reveal variants
  const [hovered, setHovered] = useState(false)

  return (
    <motion.figure
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative isolate aspect-[4/5] overflow-hidden rounded-frame bg-ink sm:aspect-[16/10] lg:col-span-5 lg:aspect-auto"
    >
      <motion.div
        variants={zoom}
        initial={false}
        animate={hovered ? 'hover' : 'rest'}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <ImageWithFallback
          src={PHOTO.image}
          alt={PHOTO.alt}
          loading="lazy"
          sizes="(min-width: 1024px) 40vw, 100vw"
          wrapperClassName="h-full w-full bg-graphite-900"
        />
      </motion.div>

      <figcaption className="sr-only">
        {PHOTO.name}, {PHOTO.location}, at dusk
      </figcaption>
    </motion.figure>
  )
}
