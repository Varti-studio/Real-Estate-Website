import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { featuredStays } from '../../data/featured'
import { stays } from '../../data/stays'
import { priceFormat } from '../../lib/format'
import { STAGGER, fadeUp, inView, staggerContainer } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import { Link } from '../../lib/router'
import { useScrollRow } from '../../lib/useScrollRow'
import { MonoLabel } from '../ui/MonoLabel'
import { RowControls } from '../ui/RowControls'
import { StayCard } from '../StayCard'

/** Card width: ~1.15 cards on mobile, ~1.6 on tablet, ~2.4 on desktop, so the next one always peeks. */
const CARD = 'w-[86%] shrink-0 snap-start sm:w-[calc((100%-24px)/1.6)] lg:w-[calc((100%-80px)/2.4)] lg:max-w-[520px]'

/**
 * Photo height cap: 4:5 when the screen is tall enough, cropped shorter otherwise, so a whole
 * card (photo, caption, meta row) plus the arrow row below fits in one viewport.
 */
// `w-full` pins the width; without it the aspect ratio would shrink the width along with the height
const PHOTO = 'w-full max-h-[max(18rem,calc(100svh-20rem))]'

/** "Six homes in six countries, from €320 to €890 a night, before taxes." */
const SUMMARY = (() => {
  const prices = featuredStays.map((s) => s.pricePerNight)
  const countries = new Set(featuredStays.map((s) => s.country)).size
  const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  const say = (n: number) => words[n - 1] ?? String(n)
  const homes = say(featuredStays.length)
  return `${homes.charAt(0).toUpperCase()}${homes.slice(1)} homes in ${say(countries)} ${countries === 1 ? 'country' : 'countries'}, from ${priceFormat.format(Math.min(...prices))} to ${priceFormat.format(Math.max(...prices))} a night, before taxes.`
})()

/** (02) Featured stays — our starting picks, as a horizontal scroll-snap row. */
export function FeaturedStays() {
  const { ref: track, state: scroll, page, reveal } = useScrollRow<HTMLUListElement>()
  const trackInView = useInView(track, inView)

  return (
    <section aria-labelledby="featured-title" className="container-x py-24 lg:py-40">
      <motion.header
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:items-end lg:gap-x-10"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3 lg:col-span-12">
          <MonoLabel className="text-accent">(02)</MonoLabel>
          <MonoLabel className="text-ink">Featured stays</MonoLabel>
        </motion.div>

        <motion.h2 id="featured-title" variants={fadeUp} className="text-h2 font-light lg:col-span-8">
          Where to <br className="hidden sm:block" />
          {`start${NBSP}`}
          <span className="accent">looking</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="max-w-xs text-body leading-[1.55] text-graphite-600 lg:col-span-4 lg:justify-self-end lg:text-right"
        >
          {typeset(SUMMARY)}
        </motion.p>
      </motion.header>

      {/* `animate` (not `whileInView`) so every card shares the list's reveal */}
      <motion.ul
        ref={track}
        id="featured-track"
        variants={staggerContainer(STAGGER.loose)}
        initial="hidden"
        animate={trackInView ? 'visible' : 'hidden'}
        aria-label="Featured stays"
        className="-mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:-mx-6 md:scroll-px-6 md:px-6 lg:mx-0 lg:mt-20 lg:scroll-px-0 lg:gap-10 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {featuredStays.map((stay) => (
          <motion.li key={stay.id} variants={fadeUp} onFocus={reveal} className={CARD}>
            <StayCard stay={stay} showIndex={false} photoClassName={PHOTO} sizes="(min-width: 1024px) 520px, (min-width: 640px) 62vw, 86vw" />
          </motion.li>
        ))}
        <motion.li variants={fadeUp} onFocus={reveal} className={CARD}>
          <CatalogCard total={stays.length} />
        </motion.li>
      </motion.ul>

      <RowControls controls="featured-track" noun="stays" state={scroll} onPage={page} className="mt-10" />
    </section>
  )
}

/** Closing tile of the row: a quiet link to the full catalogue, sized like a stay photo. */
function CatalogCard({ total }: { total: number }) {
  return (
    <Link
      to="/search"
      className={`group flex aspect-[4/5] ${PHOTO} flex-col justify-between rounded-card border border-line bg-milk p-6 transition-colors duration-500 ease-cinematic hover:bg-sand focus-visible:bg-sand lg:p-8`}
    >
      <MonoLabel>(→) Full catalogue</MonoLabel>
      <div className="flex items-end justify-between gap-6">
        <p className="text-h3 leading-[1.1] font-light tracking-[-0.03em] lg:text-h3-lg">
          See all <span className="font-mono tabular-nums">{total}</span>
          {`${NBSP}stays`}
        </p>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-milk">
          <ArrowUpRight
            size={18}
            strokeWidth={1.5}
            className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1"
          />
        </span>
      </div>
    </Link>
  )
}
