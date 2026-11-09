import { motion } from 'framer-motion'
import { stays } from '../data/stays'
import { pad } from '../lib/format'
import { STAGGER, fadeUp, inView, staggerContainer } from '../lib/motion'
import { typeset } from '../lib/typography'
import { Accented, accent } from './stay/text'
import { MonoLabel } from './ui/MonoLabel'
import { Tag } from './ui/Tag'

/**
 * The guest's path, in order. One `*accent*` per title. This is the one place on
 * the home page that describes check-in (see `CHECK_IN` in data/copy).
 */
const STEPS: { title: string; body: string }[] = [
  {
    title: 'Pick a *home*',
    body: `Filter ${stays.length} homes by place, dates, guests and price. Every listing names the architect and the host.`,
  },
  {
    title: 'Book your *dates*',
    body: 'Prices are per night, before taxes, with cleaning as a separate line and no Solum service fee. Instant-book homes confirm straight away; the rest within a day.',
  },
  {
    title: 'Check in with a *code*',
    body: '48 hours before check-in you get the exact address, directions and a door code. The host is a phone call away.',
  },
]

/** (04) How it works — three steps from browsing to arrival. */
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="container-x scroll-mt-6 pb-24 lg:pb-40">
      <motion.header
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="border-t border-line pt-8"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <MonoLabel className="text-accent">(04)</MonoLabel>
          <MonoLabel className="text-ink">How it works</MonoLabel>
        </motion.div>

        <motion.h2 id="how-title" variants={fadeUp} className="mt-8 max-w-[16ch] text-h2 font-light lg:mt-12">
          From search to {accent('arrival')}
        </motion.h2>
      </motion.header>

      <motion.ol
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="mt-12 grid lg:mt-20 lg:grid-cols-3 lg:gap-x-20"
      >
        {STEPS.map((step, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            // Below lg each step is a row under a hairline. From lg, the divider is pulled into the
            // middle of the gap (-ml-10 / pl-10), so all three columns keep the same text width.
            className={`group border-t border-line py-10 transition-colors duration-500 ease-cinematic hover:border-stone-500 md:grid md:grid-cols-12 md:gap-x-6 lg:block lg:border-t-0 lg:py-0 ${
              i > 0 ? 'lg:-ml-10 lg:border-l lg:pl-10' : ''
            }`}
          >
            <div className="md:col-span-4">
              <Tag className="transition-colors duration-500 ease-cinematic group-hover:border-ink group-hover:bg-ink group-hover:text-milk">
                {`Step ${pad(i + 1)}`}
              </Tag>
            </div>

            <div className="mt-8 md:col-span-8 md:mt-0 lg:mt-24">
              <h3 className="text-h3 leading-[1.1] font-light tracking-[-0.03em] text-ink lg:text-h3-lg">
                <Accented text={step.title} />
              </h3>
              <p className="mt-4 max-w-[40ch] text-body leading-[1.55] text-graphite-600">{typeset(step.body)}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
