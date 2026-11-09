import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { StayPhoto } from '../../data/stayStories'
import { pad } from '../../lib/format'
import { DURATION, STAGGER, fadeUp, staggerContainer, transition } from '../../lib/motion'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { Sheet } from '../ui/Sheet'

type StayGalleryProps = {
  photos: StayPhoto[]
  name: string
}

/**
 * The hero media grid: a large exterior on the left (3 fr), two photos stacked
 * on the right (2 fr). Below `md` it becomes a scroll-snap row. Any photo, or
 * the floating pill, opens every photo in a full-screen sheet.
 */
export function StayGallery({ photos, name }: StayGalleryProps) {
  const [sheet, setSheet] = useState<{ open: boolean; at: number }>({ open: false, at: 0 })
  const open = (at: number) => setSheet({ open: true, at })
  const [hero, ...rest] = photos
  const side = rest.slice(0, 2)
  const label = `Show all ${photos.length} photos`

  return (
    <>
      {/* md+: asymmetric grid */}
      <motion.div
        variants={staggerContainer(STAGGER.tight, 0.35)}
        initial="hidden"
        animate="visible"
        className={`relative mt-8 hidden h-[clamp(22rem,62svh,40rem)] gap-2 md:grid lg:mt-10 ${
          side.length ? 'grid-cols-[3fr_2fr] grid-rows-2' : 'grid-cols-1'
        }`}
      >
        {hero && <Tile photo={hero} label={`Open photo 1, ${hero.caption}`} onOpen={() => open(0)} priority className="row-span-2" />}
        {side.map((photo, i) => (
          <Tile
            key={photo.image}
            photo={photo}
            label={`Open photo ${i + 2}, ${photo.caption}`}
            onOpen={() => open(i + 1)}
            className={side.length === 1 ? 'row-span-2' : ''}
          />
        ))}

        {photos.length > 1 && (
          <motion.button
            type="button"
            variants={fadeUp}
            onClick={() => open(0)}
            className="group absolute right-4 bottom-4 inline-flex h-11 items-center gap-2.5 rounded-full bg-milk/85 pr-4 pl-5 text-body tracking-[-0.01em] text-ink backdrop-blur-md transition-colors duration-500 ease-cinematic hover:bg-milk"
          >
            {label}
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-0.5 group-focus-visible:translate-x-1"
            />
          </motion.button>
        )}
      </motion.div>

      {/* Below md: snap row */}
      <MobileRow photos={photos} onOpen={open} label={label} />

      <PhotoSheet
        open={sheet.open}
        at={sheet.at}
        photos={photos}
        name={name}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
      />
    </>
  )
}

function Tile({
  photo,
  label,
  onOpen,
  priority = false,
  className = '',
}: {
  photo: StayPhoto
  label: string
  onOpen: () => void
  priority?: boolean
  className?: string
}) {
  // Hover as state, so the zoom doesn't fight the tile's own reveal variants
  const [active, setActive] = useState(false)

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      onClick={onOpen}
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onFocus={(e) => setActive(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setActive(false)}
      aria-label={label}
      className={`relative overflow-hidden rounded-card bg-sand ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ scale: active ? 1.02 : 1 }}
        transition={transition(DURATION.image)}
        className="absolute inset-0 will-change-transform"
      >
        <ImageWithFallback
          src={photo.image}
          alt={photo.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          sizes={priority ? '(min-width: 1680px) 960px, 60vw' : '(min-width: 1680px) 640px, 40vw'}
          wrapperClassName="h-full w-full"
        />
      </motion.div>
    </motion.button>
  )
}

function MobileRow({ photos, onOpen, label }: { photos: StayPhoto[]; onOpen: (at: number) => void; label: string }) {
  const row = useRef<HTMLUListElement>(null)
  const [current, setCurrent] = useState(0)

  const onScroll = () => {
    const el = row.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const step = first.offsetWidth + 8
    setCurrent(Math.min(photos.length - 1, Math.round(el.scrollLeft / step)))
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-8 md:hidden">
      <ul
        ref={row}
        onScroll={onScroll}
        aria-label="Photos"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <li key={photo.image} className="w-[86%] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Open photo ${i + 1}, ${photo.caption}`}
              className={`block aspect-[5/4] w-full overflow-hidden rounded-card`}
            >
              <ImageWithFallback
                src={photo.image.replace(/w=\d+/, 'w=900')}
                alt={photo.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                sizes="86vw"
                wrapperClassName="h-full w-full"
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="font-mono text-label text-graphite-600 tabular-nums" aria-live="polite">
          <span className="text-ink">{current + 1}</span> / {photos.length}
        </p>
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line pr-3 pl-4 text-body transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk"
          >
            {label}
            <ArrowUpRight size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

/** Every photo, full screen, in an editorial two-column rhythm; lands on the one that was opened. */
function PhotoSheet({
  open,
  at,
  photos,
  name,
  onClose,
}: {
  open: boolean
  at: number
  photos: StayPhoto[]
  name: string
  onClose: () => void
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`${name} — photos`}
      count={photos.length}
      variant="full"
      onOpened={(body) => {
        const target = at > 0 ? body.querySelector<HTMLElement>(`[data-photo="${at}"]`) : null
        if (target) body.scrollTo({ top: target.offsetTop - 24 })
      }}
    >
      <ul className="container-x grid gap-x-6 gap-y-12 py-10 md:grid-cols-2 lg:gap-x-10 lg:py-16">
        {photos.map((photo, i) => {
          // Every third photo runs the full width
          const wide = i % 3 === 0
          return (
            <motion.li key={photo.image} data-photo={i} variants={fadeUp} className={wide ? 'md:col-span-2' : ''}>
              <figure>
                <ImageWithFallback
                  src={photo.image.replace(/w=\d+/, wide ? 'w=2000' : 'w=1200')}
                  alt={photo.alt}
                  loading="lazy"
                  sizes={wide ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
                  wrapperClassName={`w-full rounded-card ${wide ? 'aspect-[4/3] md:aspect-[16/9]' : 'aspect-[4/5]'}`}
                />
                <figcaption className="mt-3 flex items-baseline gap-3 font-mono text-label tracking-label text-graphite-600 uppercase">
                  <span className="text-ink tabular-nums">{pad(i + 1)}</span>
                  {photo.caption}
                </figcaption>
              </figure>
            </motion.li>
          )
        })}
      </ul>
    </Sheet>
  )
}
