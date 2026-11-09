import { useId, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ArrowRight, DraftingCompass, KeyRound, Leaf, PawPrint, ShieldCheck, Sun, Zap, type LucideIcon } from 'lucide-react'
import type { StandardIcon } from '../../data/stayStories'
import type { Stay } from '../../data/stays'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../../lib/motion'
import type { Story } from '../../lib/stay'
import { NBSP, typeset } from '../../lib/typography'
import { ImageWithFallback } from '../ui/ImageWithFallback'
import { MonoLabel } from '../ui/MonoLabel'
import { HostAvatar } from './HostAvatar'
import { StaySection } from './StaySection'
import { accent } from './text'

const plural = (n: number, one: string, many: string) => `${n}${NBSP}${n === 1 ? one : many}`

/** Who hosts the stay, who designed it, and what it sleeps. */
export function HostSummary({ stay, story }: { stay: Stay; story: Story }) {
  const { host, rooms } = story
  return (
    <motion.section
      aria-label="Host and capacity"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      className="flex items-center justify-between gap-6 border-t border-line py-8 lg:py-10"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <h2 className="text-title leading-[1.1] font-light tracking-[-0.03em] lg:text-h3">
          Hosted by{NBSP}{accent(host.name)}
        </h2>
        <p className="font-mono text-label tracking-label text-graphite-600 uppercase tabular-nums">
          {[plural(stay.guests, 'guest', 'guests'), plural(rooms.bedrooms, 'bedroom', 'bedrooms'), rooms.beds, rooms.baths]
            .map(typeset)
            .join(' · ')}
        </p>
        <p className="text-body text-graphite-600">
          {typeset(`Designed by ${stay.architect} · Host since ${host.since} · ${host.responds}`)}
        </p>
      </div>
      <HostAvatar name={host.name} photo={host.photo} className="size-16 text-h3 lg:size-20 lg:text-h3-lg" />
    </motion.section>
  )
}

const STANDARD_ICONS: Record<StandardIcon, LucideIcon> = {
  key: KeyRound,
  sun: Sun,
  compass: DraftingCompass,
  leaf: Leaf,
  shield: ShieldCheck,
  zap: Zap,
  paw: PawPrint,
}

/** Three facts about the stay (check-in, booking, power or pets), each with a hairline icon. */
export function KeyStandards({ story }: { story: Story }) {
  return (
    <motion.ul
      aria-label="Key standards"
      variants={staggerContainer(STAGGER.base)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      // Below md the standards stack like How it works' steps: icon, then heading and body, rows split by hairlines
      className="grid border-t border-line py-10 md:grid-cols-3 md:gap-10 lg:py-12"
    >
      {story.standards.map(({ icon, title, body }) => {
        const Icon = STANDARD_ICONS[icon]
        return (
          <motion.li
            key={title}
            variants={fadeUp}
            className="flex flex-col gap-8 border-t border-line py-8 first:border-t-0 first:pt-0 last:pb-0 md:gap-4 md:border-t-0 md:py-0"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink">
              <Icon size={18} strokeWidth={1.5} aria-hidden />
            </span>
            <div className="flex flex-col gap-4 md:gap-1.5">
              <h3 className="text-h3 font-light md:text-title">{title}</h3>
              <p className="text-body leading-[1.55] text-graphite-600">{typeset(body)}</p>
            </div>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}

/** Two paragraphs, the rest behind "Read more". The first reads as a lede. */
export function AboutSpace({ story }: { story: Story }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const [lede, second, ...more] = story.about

  return (
    <StaySection id="about" index="(01)" title={<>About this {accent('space')}</>}>
      <div className="flex max-w-[64ch] flex-col gap-5">
        <p className="text-title leading-[1.45] font-light tracking-[-0.01em] text-ink">{typeset(lede)}</p>
        {second && <p className="text-body leading-[1.55] text-graphite-600">{typeset(second)}</p>}

        <AnimatePresence initial={false}>
          {open && (
            // Accordion panels are the one place height animates (see the motion notes in the design system)
            <motion.div
              id={id}
              key="more"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, transition: transition(DURATION.ui) }}
              exit={{ height: 0, opacity: 0, transition: transition(DURATION.ui) }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-5">
                {more.map((p) => (
                  <p key={p} className="text-body leading-[1.55] text-graphite-600">
                    {typeset(p)}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {more.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={open ? id : undefined}
            onClick={() => setOpen((o) => !o)}
            className="group inline-flex w-fit items-center gap-2 text-body text-ink"
          >
            <span className="relative">
              {open ? 'Show less' : 'Read more'}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-cinematic group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
            </span>
            <ArrowRight
              size={16}
              strokeWidth={1.5}
              aria-hidden
              className={`transition-transform duration-500 ease-cinematic ${
                open ? '-rotate-90' : 'group-hover:translate-x-1 group-focus-visible:translate-x-1'
              }`}
            />
          </button>
        )}
      </div>
    </StaySection>
  )
}

const zoom: Variants = {
  rest: { scale: 1, transition: transition(DURATION.image) },
  hover: { scale: 1.03, transition: transition(DURATION.image) },
}

/** Compact cards for each sleeping space. */
export function SleepCards({ story }: { story: Story }) {
  return (
    <StaySection id="sleep" index="(03)" title={<>Where you will {accent('sleep')}</>}>
      <ul className="grid max-w-3xl gap-x-6 gap-y-10 sm:grid-cols-2">
        {story.sleep.map((room) => (
          <motion.li key={room.title} initial="rest" whileHover="hover">
            <figure>
              <div className="aspect-[4/3] overflow-hidden rounded-card">
                <motion.div variants={zoom} className="h-full w-full will-change-transform">
                  <ImageWithFallback
                    src={room.image}
                    alt={room.alt}
                    loading="lazy"
                    sizes="(min-width: 640px) 384px, 100vw"
                    wrapperClassName="h-full w-full"
                  />
                </motion.div>
              </div>
              <figcaption className="mt-4 flex flex-col gap-1.5">
                <span className="text-title tracking-[-0.02em]">{room.title}</span>
                <span className="font-mono text-label tracking-label text-graphite-600 uppercase">{typeset(room.detail)}</span>
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>
    </StaySection>
  )
}

/** House rules, safety, cancellation — three columns of plain facts. */
export function ThingsToKnow({ story }: { story: Story }) {
  const columns = [
    { title: 'House rules', items: story.rules.house },
    { title: 'Safety & property', items: story.rules.safety },
    { title: 'Cancellation', items: story.rules.cancellation },
  ]

  return (
    <StaySection id="things-to-know" index="(07)" title={<>Things to {accent('know')}</>}>
      <div className="grid gap-10 md:grid-cols-3">
        {columns.map(({ title, items }) => (
          <div key={title}>
            <h3>
              <MonoLabel className="text-ink">{title}</MonoLabel>
            </h3>
            <ul className="mt-5 border-t border-line">
              {items.map((item) => (
                <li key={item} className="border-b border-line py-3 text-body text-graphite-600">
                  {typeset(item)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </StaySection>
  )
}
