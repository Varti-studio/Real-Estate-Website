import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { collections, type CollectionId } from '../../data/collections'
import { stays } from '../../data/stays'
import { DEFAULT_FILTERS, filtersToSearch } from '../../lib/filters'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import { navigate } from '../../lib/router'
import { Button } from '../ui/Button'
import { MonoLabel } from '../ui/MonoLabel'
import { CollectionGallery } from './CollectionGallery'
import { CollectionTabs } from './CollectionTabs'

/** Collections with their stays, in switcher order. An empty collection is not shown. */
const ITEMS = collections
  .map((collection) => ({
    collection,
    stays: stays.filter((s) => s.collections.includes(collection.id)),
  }))
  .filter((i) => i.stays.length > 0)

const TABS = ITEMS.map((i) => ({ collection: i.collection, count: i.stays.length }))

const catalogUrl = (id: CollectionId) => `/search${filtersToSearch({ ...DEFAULT_FILTERS, collection: id })}`

/** (03) Collections — vertical collection switcher beside a stay showcase. */
export function CuratedCollections() {
  const [active, setActive] = useState<CollectionId>(ITEMS[0].collection.id)
  const current = ITEMS.find((i) => i.collection.id === active) ?? ITEMS[0]

  return (
    <section id="collections" aria-labelledby="collections-title" className="container-x scroll-mt-6 pb-24 lg:pb-40">
      <motion.header
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="grid gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:items-end lg:gap-10"
      >
        <div className="lg:col-span-7">
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <MonoLabel className="text-accent">(03)</MonoLabel>
            <MonoLabel className="text-ink">Collections</MonoLabel>
          </motion.div>

          <motion.h2 id="collections-title" variants={fadeUp} className="mt-8 text-h2 font-light lg:mt-12">
            Homes grouped <br className="hidden sm:block" />
            {`by${NBSP}`}
            <span className="accent">landscape</span>
          </motion.h2>
        </div>

        {/* Two set lines from xl; below that the column is too narrow, so it flows freely */}
        <motion.p
          variants={fadeUp}
          className="max-w-sm text-body leading-[1.55] text-graphite-600 lg:col-span-5 lg:justify-self-end lg:text-right xl:max-w-none"
        >
          <span className="xl:block">
            {typeset('Explore homes through the landscapes that shape them.')}
          </span>{' '}
          <span className="xl:block">
            {typeset('Each collection brings together places with a distinct sense of setting.')}
          </span>
        </motion.p>
      </motion.header>

      <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-10">
        {/* Switcher */}
        <div className="flex flex-col gap-10 lg:col-span-4 lg:justify-between">
          <CollectionTabs
            items={TABS}
            value={active}
            onSelect={setActive}
            onOpen={(id) => navigate(catalogUrl(id))}
          />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            className="hidden border-t border-line pt-6 lg:block"
          >
            {/* Fixed height, so a longer description never nudges the button */}
            <div className="min-h-17">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: transition(DURATION.ui) }}
                  exit={{ opacity: 0, y: -8, transition: transition(DURATION.micro) }}
                  className="max-w-[40ch] text-body leading-[1.55] text-graphite-600"
                >
                  {typeset(current.collection.description)}
                </motion.p>
              </AnimatePresence>
            </div>
            <Button
              variant="ghost"
              href={catalogUrl(active)}
              onClick={(e) => {
                e.preventDefault()
                navigate(catalogUrl(active))
              }}
              className="mt-6"
            >
              Open collection
            </Button>
          </motion.div>
        </div>

        {/* Showcase — keyed by collection so a switch fades the whole gallery */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${current.collection.title} stays`}
          className="lg:col-span-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1, transition: transition(DURATION.micro) }}
              exit={{ opacity: 0, scale: 0.99, transition: transition(DURATION.micro) }}
            >
              <CollectionGallery stays={current.stays} />
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            href={catalogUrl(active)}
            onClick={(e) => {
              e.preventDefault()
              navigate(catalogUrl(active))
            }}
            className="mt-8 lg:hidden"
          >
            Open {current.collection.title}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
