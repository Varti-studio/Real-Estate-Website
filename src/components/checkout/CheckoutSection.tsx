import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, inView } from '../../lib/motion'

/** One block of the checkout form: a hairline, a light heading, the content. Fades up as it scrolls in. */
export function CheckoutSection({
  id,
  title,
  intro,
  raised = false,
  children,
}: {
  id: string
  title: ReactNode
  /** A line under the heading. */
  intro?: ReactNode
  /**
   * Lifts the section above the ones after it. Each section's reveal
   * (transform + filter) makes it its own stacking layer, so a popover inside
   * would otherwise slide under the next sections, whatever its z-index.
   */
  raised?: boolean
  children: ReactNode
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      aria-labelledby={`${id}-title`}
      className={`border-t border-line py-10 lg:py-12 ${raised ? 'relative z-10' : ''}`}
    >
      <h2 id={`${id}-title`} className="text-title leading-[1.1] font-light tracking-[-0.03em]">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-xl text-body leading-[1.55] text-graphite-600">{intro}</p>}
      <div className="mt-6 lg:mt-8">{children}</div>
    </motion.section>
  )
}
