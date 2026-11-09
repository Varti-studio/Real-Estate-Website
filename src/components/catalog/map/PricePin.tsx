import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Stay } from '../../../data/stays'
import { priceFormat } from '../../../lib/format'
import { DURATION, transition } from '../../../lib/motion'
import { linkClick } from '../../../lib/router'
import { ImageWithFallback } from '../../ui/ImageWithFallback'

/** Where the preview card opens relative to the pin, so it stays inside the map. */
export type PreviewPlacement = { vertical: 'above' | 'below'; align: 'center' | 'start' | 'end' }

type PricePinProps = {
  stay: Stay
  /** The stay's page, opened from the preview card. */
  href: string
  /** In the current results; otherwise the pin shrinks away and leaves the tab order. */
  visible: boolean
  /** Its card is hovered, or the pin itself is active. */
  highlighted: boolean
  /** Show the preview card. */
  open: boolean
  placement: PreviewPlacement
  onActivate: () => void
  onDeactivate: () => void
}

const ALIGN = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
  end: 'right-0',
} as const

/**
 * Oval price badge on the map. Highlighted pins fill `graphite-900` and grow
 * to 1.15; hovering or focusing one opens a compact preview card.
 */
export function PricePin({ stay, href, visible, highlighted, open, placement, onActivate, onDeactivate }: PricePinProps) {
  const above = placement.vertical === 'above'
  const price = priceFormat.format(stay.pricePerNight)

  return (
    <div
      className="relative"
      onMouseEnter={visible ? onActivate : undefined}
      onMouseLeave={visible ? onDeactivate : undefined}
      onFocus={onActivate}
      onBlur={(e) => {
        // Moving focus from the pin into its preview keeps it open
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDeactivate()
      }}
    >
      <motion.button
        type="button"
        onClick={onActivate}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label={`${stay.name}, ${price} per night`}
        aria-expanded={open}
        initial={false}
        animate={{ opacity: visible ? 1 : 0, scale: !visible ? 0.6 : highlighted ? 1.15 : 1 }}
        transition={transition(DURATION.micro)}
        className={`flex h-8 items-center rounded-full border px-3 font-mono text-label whitespace-nowrap tabular-nums shadow-lift transition-colors duration-500 ease-cinematic focus-visible:outline-offset-2 ${
          visible ? '' : 'pointer-events-none'
        } ${highlighted ? 'border-accent bg-accent text-milk' : 'border-line bg-milk text-ink'}`}
      >
        {price}
      </motion.button>

      <AnimatePresence>
        {open && visible && (
          <div className={`absolute z-10 ${above ? 'bottom-full pb-3' : 'top-full pt-3'} ${ALIGN[placement.align]}`}>
            <motion.a
              href={href}
              onClick={(e) => linkClick(e, href)}
              initial={{ opacity: 0, y: above ? 8 : -8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: above ? 4 : -4, filter: 'blur(2px)', transition: transition(DURATION.micro * 0.6) }}
              transition={transition(DURATION.micro)}
              aria-label={`${stay.name}, ${stay.location}. Rated ${stay.rating} out of 10. ${price} per night.`}
              className="block w-64 rounded-frame border border-line bg-milk p-2 font-sans text-ink shadow-soft"
            >
              <ImageWithFallback
                src={stay.image.replace(/w=\d+/, 'w=600')}
                alt=""
                wrapperClassName="aspect-[16/10] rounded-card"
              />
              <div className="flex flex-col gap-2 px-2 pt-3 pb-2">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-body tracking-[-0.02em]">{stay.name}</p>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-label tabular-nums">
                    <Star size={12} strokeWidth={1.5} className="fill-ink" aria-hidden />
                    {stay.rating.toFixed(1)}
                    <span className="text-graphite-600">({stay.reviews})</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 font-mono text-label tabular-nums">
                  <span className="truncate text-graphite-600">
                    {stay.location}, {stay.countryCode}
                  </span>
                  <span className="shrink-0">
                    {price}
                    <span className="text-graphite-600"> / night</span>
                  </span>
                </div>
              </div>
            </motion.a>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
