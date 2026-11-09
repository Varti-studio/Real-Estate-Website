import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { INTRO } from '../data/copy'
import { heroImage } from '../data/stays'
import { DURATION, STAGGER, fade, fadeUp, lineReveal, staggerContainer, transition } from '../lib/motion'
import { typeset } from '../lib/typography'
import { ImageWithFallback } from './ui/ImageWithFallback'
import { SearchBar, type SearchBarProps } from './search/SearchBar'

const HEADLINE: ReactNode[] = [
  'Architecture',
  <>
    you can <span className="accent">sleep</span> in.
  </>,
]

export function Hero(search: SearchBarProps) {
  return (
    <section aria-labelledby="hero-title" className="container-x pt-4 pb-4">
      <div className="relative isolate flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden rounded-frame bg-graphite-900 text-milk lg:h-[clamp(600px,calc(100svh-112px),1080px)] lg:min-h-0">
        {/* Photo */}
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={transition(DURATION.hero)}
        >
          <ImageWithFallback
            src={heroImage.src}
            alt={heroImage.alt}
            fetchPriority="high"
            wrapperClassName="h-full w-full bg-graphite-800"
          />
        </motion.div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink/30 md:bg-ink/15" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-ink/75 via-ink/30 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
        />

        {/* Top meta row */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="visible"
          className="flex items-start justify-between gap-6 p-5 md:px-10 md:py-9"
        >
          <span className="font-mono text-label tracking-label text-milk/80 uppercase">
            {typeset('(01) — Architect-designed stays')}
          </span>
        </motion.div>

        {/* Headline + intro */}
        <div className="mt-auto grid gap-8 px-5 pt-16 pb-6 md:px-10 md:pb-8 lg:grid-cols-12 lg:items-end">
          <motion.h1
            id="hero-title"
            variants={staggerContainer(STAGGER.base, 0.25)}
            initial="hidden"
            animate="visible"
            className="text-display font-light lg:col-span-9"
          >
            {HEADLINE.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={lineReveal} className="block will-change-transform">
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.div
            variants={staggerContainer(STAGGER.base, 0.7)}
            initial="hidden"
            animate="visible"
            className="flex max-w-sm flex-col gap-5 lg:col-span-3 lg:justify-self-end"
          >
            <motion.span variants={fadeUp} className="block h-px w-12 bg-milk/40" />
            <motion.p variants={fadeUp} className="text-body leading-[1.55] text-milk/80">
              {typeset(
                `${INTRO} Book by the night, with no Solum service fee.`,
              )}
            </motion.p>
          </motion.div>
        </div>

        {/* Docked search */}
        <motion.div
          variants={staggerContainer(0, 0.9)}
          initial="hidden"
          animate="visible"
          className="px-3 pb-3 md:px-6 md:pb-6"
        >
          <motion.div variants={fadeUp}>
            <SearchBar {...search} />
          </motion.div>
        </motion.div>

        {/* Architectural corner brackets */}
        <Corner className="top-5 left-5 border-t border-l" />
        <Corner className="top-5 right-5 border-t border-r" />
      </div>
    </section>
  )
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute hidden size-3 border-milk/40 md:block ${className}`}
    />
  )
}
