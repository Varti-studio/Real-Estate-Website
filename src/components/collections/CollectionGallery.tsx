import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { PRICE } from '../../data/copy'
import type { Stay } from '../../data/stays'
import { stayUrl } from '../../lib/stay'
import { priceFormat } from '../../lib/format'
import { DURATION, STAGGER, transition } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import { Link } from '../../lib/router'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { Tag } from '../ui/Tag'

type Direction = 1 | -1

/** Slides drift in from the side they're travelling from and cross-fade over the outgoing one. */
const slide = (delay = 0): Variants => ({
  enter: (dir: Direction) => ({ opacity: 0, x: `${dir * 4}%`, filter: 'blur(6px)' }),
  center: { opacity: 1, x: '0%', filter: 'blur(0px)', transition: transition(DURATION.ui, delay) },
  exit: (dir: Direction) => ({
    opacity: 0,
    x: `${dir * -4}%`,
    filter: 'blur(6px)',
    transition: transition(DURATION.ui, delay),
  }),
})

const mainSlide = slide()
const detailSlide = slide(STAGGER.tight)

const zoom = (active: boolean) => ({ scale: active ? 1.03 : 1 })

/** Showcase of one collection: a large stay card, its material detail, and slide controls. */
export function CollectionGallery({ stays }: { stays: Stay[] }) {
  const [[index, dir], setSlide] = useState<[number, Direction]>([0, 1])
  const total = stays.length
  const stay = stays[index]
  const next = stays[(index + 1) % total]
  const detail = stay.detail ?? { image: next.image, alt: next.alt, caption: `Next — ${next.name}` }

  const go = (d: Direction) => setSlide(([i]) => [(i + d + total) % total, d])

  return (
    <div className="grid gap-6 sm:grid-cols-[3fr_2fr]">
      <MainCard stay={stay} dir={dir} />

      <div className="flex flex-col gap-6">
        <DetailCard id={stay.id} detail={detail} dir={dir} />

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4 sm:border-0 sm:pt-0">
          <p className="font-mono text-body tabular-nums" aria-hidden>
            <span className="text-ink">{index + 1}</span>
            <span className="text-graphite-600"> / {total}</span>
          </p>
          <p className="sr-only" aria-live="polite">
            {`${stay.name}, ${index + 1} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <NavButton label="Previous stay" disabled={total < 2} onClick={() => go(-1)}>
              <ArrowLeft
                size={16}
                strokeWidth={1.5}
                className="transition-transform duration-500 ease-cinematic group-hover:-translate-x-1"
              />
            </NavButton>
            <NavButton label="Next stay" disabled={total < 2} onClick={() => go(1)}>
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1"
              />
            </NavButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function MainCard({ stay, dir }: { stay: Stay; dir: Direction }) {
  // Tracked apart so a pointer leaving doesn't cancel keyboard focus, and vice versa
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const canHover = useMediaQuery('(hover: hover)')
  const active = hovered || focused
  const price = priceFormat.format(stay.pricePerNight)

  return (
    <Link
      to={stayUrl(stay.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label={`${stay.name}, ${stay.type} in ${stay.location}, ${stay.country}. ${price} ${PRICE.unit}.`}
      className="relative isolate block aspect-[4/5] overflow-hidden rounded-card bg-sand sm:aspect-square"
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={stay.id}
          custom={dir}
          variants={mainSlide}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <motion.div
            animate={zoom(active)}
            transition={transition(DURATION.image)}
            className="absolute inset-0 will-change-transform"
          >
            <ImageWithFallback
              src={stay.image}
              alt={stay.alt}
              loading="lazy"
              sizes="(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 100vw"
              wrapperClassName="h-full w-full"
            />
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 text-milk md:p-6">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-label tracking-label text-milk/70 uppercase tabular-nums">
                {stay.type}
              </span>
              <h3 className="text-title leading-[1.1] font-light tracking-[-0.03em] md:text-h3">{stay.name}</h3>
              <p className="text-body text-milk/75">
                {stay.location}, {stay.country}
              </p>
            </div>
            <Tag tone="photo" className="tabular-nums">
              {`${price}${NBSP}/${NBSP}night`}
            </Tag>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.span
        aria-hidden
        initial={false}
        animate={{ opacity: active || !canHover ? 1 : 0, y: active || !canHover ? 0 : 8 }}
        transition={transition(active ? DURATION.ui : DURATION.micro)}
        className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-milk text-ink md:top-5 md:right-5"
      >
        <ArrowUpRight size={18} strokeWidth={1.5} />
      </motion.span>
    </Link>
  )
}

function DetailCard({
  id,
  detail,
  dir,
}: {
  id: string
  detail: { image: string; alt: string; caption: string }
  dir: Direction
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <figure
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative isolate hidden aspect-[4/5] overflow-hidden rounded-card bg-sand sm:block"
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={id}
          custom={dir}
          variants={detailSlide}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <motion.div
            animate={zoom(hovered)}
            transition={transition(DURATION.image)}
            className="absolute inset-0 will-change-transform"
          >
            <ImageWithFallback
              src={detail.image}
              alt={detail.alt}
              loading="lazy"
              sizes="(min-width: 1024px) 26vw, 40vw"
              wrapperClassName="h-full w-full"
            />
          </motion.div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/60 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 text-milk md:p-5">
            <span className="font-mono text-label tracking-label text-milk/70 uppercase">Detail</span>
            <span className="text-body leading-snug">{typeset(detail.caption)}</span>
          </figcaption>
        </motion.div>
      </AnimatePresence>
    </figure>
  )
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group grid size-12 place-items-center rounded-full border border-line text-ink transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk disabled:pointer-events-none disabled:text-stone-300"
    >
      {children}
    </button>
  )
}
