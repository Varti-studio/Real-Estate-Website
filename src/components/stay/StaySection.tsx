import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, inView } from '../../lib/motion'
import { MonoLabel } from '../ui/MonoLabel'

type StaySectionProps = {
  id: string
  /** Mono index, e.g. "(03)". */
  index: string
  title: ReactNode
  /** Quiet line under the title: dates, coordinates. */
  meta?: ReactNode
  /** Right-aligned beside the title, e.g. a button. */
  aside?: ReactNode
  children: ReactNode
}

/** One block of the stay story: a hairline, a mono index, a light heading, then the content. */
export function StaySection({ id, index, title, meta, aside, children }: StaySectionProps) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      className="scroll-mt-6 border-t border-line py-12 lg:py-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex flex-col gap-4">
          <MonoLabel className="text-accent">{index}</MonoLabel>
          <h2 id={`${id}-title`} className="text-h3 font-light">
            {title}
          </h2>
          {meta && <p className="font-mono text-label text-graphite-600 tabular-nums">{meta}</p>}
        </div>
        {aside}
      </div>
      <div className="mt-8 lg:mt-10">{children}</div>
    </motion.section>
  )
}

/** Secondary pill under a list: "Show all 32 amenities". */
export function MoreButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 inline-flex h-11 items-center rounded-full border border-line px-5 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk"
    >
      {children}
    </button>
  )
}
