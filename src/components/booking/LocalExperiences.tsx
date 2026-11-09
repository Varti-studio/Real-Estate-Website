import { motion } from 'framer-motion'
import type { Experience } from '../../data/experiences'
import { priceFormat } from '../../lib/format'
import { STAGGER, fadeUp, inView, staggerContainer } from '../../lib/motion'
import { NBSP } from '../../lib/typography'
import { accent } from '../stay/text'
import { ImageWithFallback } from '../ui/ImageWithFallback'

/** "While you are there": things to do near the stay. Hidden when it has none. */
export function LocalExperiences({ items }: { items: Experience[] }) {
  if (!items.length) return null

  return (
    <section aria-labelledby="experiences-title" className="border-t border-line bg-milk print:hidden">
      <div className="container-x py-16 lg:py-24">
        <motion.header variants={fadeUp} initial="hidden" whileInView="visible" viewport={inView}>
          <h2 id="experiences-title" className="text-h3 font-light">
            While you are{NBSP}{accent('there')}
          </h2>
        </motion.header>

        <motion.ul
          variants={staggerContainer(STAGGER.base)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4"
        >
          {items.map((item) => (
            <ExperienceCard key={item.id} item={item} />
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

/** No experience pages yet, so a card is plain content: no link, no hover. */
function ExperienceCard({ item }: { item: Experience }) {
  return (
    <motion.li variants={fadeUp}>
      <span className="relative block aspect-[4/3] overflow-hidden rounded-card">
        <ImageWithFallback src={item.image} alt={item.alt} loading="lazy" sizes="(min-width: 1024px) 22vw, (min-width: 640px) 46vw, 100vw" wrapperClassName="h-full w-full" />
      </span>
      <span className="mt-4 block text-title tracking-[-0.02em] text-ink">{item.title}</span>
      <span className="mt-1 block font-mono text-label text-graphite-600 tabular-nums">
        Experience · {item.hours} {item.hours === 1 ? 'hour' : 'hours'}
      </span>
      <span className="mt-2 block text-body text-ink tabular-nums">From {priceFormat.format(item.priceFrom)} per person</span>
    </motion.li>
  )
}
