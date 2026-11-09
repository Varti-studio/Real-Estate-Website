import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Heart, Share2, Star } from 'lucide-react'
import type { Stay } from '../../data/stays'
import { roughCoordinates } from '../../lib/format'
import { DURATION, STAGGER, fadeUp, lineReveal, staggerContainer, transition } from '../../lib/motion'
import { Link } from '../../lib/router'
import { plainText, type Story } from '../../lib/stay'
import { Tag } from '../ui/Tag'
import { Accented } from './text'
import { useWishlist } from './useWishlist'

type StayHeaderProps = {
  stay: Stay
  story: Story
  /** "/search", with the visitor's dates and guests. */
  backTo: string
}

const ACTION =
  'inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk'

/** Back link, the stay's name, its rating, badge and place, with Share and Save. */
export function StayHeader({ stay, story, backTo }: StayHeaderProps) {
  const [saved, toggleSaved] = useWishlist(stay.id)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(t)
  }, [copied])

  const share = async () => {
    const data = { title: `${stay.name} — Solum`, url: window.location.href }
    try {
      if (navigator.share) return await navigator.share(data)
      await navigator.clipboard.writeText(data.url)
      setCopied(true)
    } catch {
      /* dismissed, or no clipboard access */
    }
  }

  return (
    <motion.header
      variants={staggerContainer(STAGGER.base, 0.2)}
      initial="hidden"
      animate="visible"
      className="pt-6 lg:pt-10"
    >
      <motion.div variants={fadeUp}>
        <Link
          to={backTo}
          className="group inline-flex items-center gap-2 text-body text-graphite-600 transition-colors duration-500 ease-cinematic hover:text-ink"
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.5}
            className="transition-transform duration-500 ease-cinematic group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
          />
          Back to all stays
        </Link>
      </motion.div>

      <h1 aria-label={plainText(story.headline)} className="mt-8 max-w-[20ch] text-h2 font-light lg:mt-10">
        {/* One mask around the whole title: it wraps freely at every width */}
        <span aria-hidden className="block overflow-hidden pb-[0.12em]">
          <motion.span variants={lineReveal} className="block">
            <Accented text={story.headline} />
          </motion.span>
        </span>
      </h1>

      <motion.div
        variants={fadeUp}
        className="mt-6 flex flex-col gap-5 lg:mt-8 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href="#reviews"
            className="inline-flex items-center gap-1.5 font-mono text-body tabular-nums underline-offset-4 hover:underline"
          >
            <Star size={14} strokeWidth={1.5} className="fill-ink" aria-hidden />
            {stay.rating.toFixed(1)}
            <span className="text-graphite-600">({stay.reviews} reviews)</span>
          </a>
          {story.badge && <Badge label={story.badge.label} hint={story.badge.hint} />}
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-body text-graphite-600">
            <span>
              {story.region}, {stay.country}
            </span>
            <span className="font-mono text-label tabular-nums">{roughCoordinates(stay.coordinates)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={share} className={ACTION}>
            <Share2 size={16} strokeWidth={1.5} aria-hidden />
            <span className="relative inline-grid" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? 'copied' : 'share'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={transition(DURATION.micro)}
                >
                  {copied ? 'Link copied' : 'Share'}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
          <button type="button" onClick={toggleSaved} aria-pressed={saved} className={ACTION}>
            <Heart
              size={16}
              strokeWidth={1.5}
              aria-hidden
              className={`transition-colors duration-500 ease-cinematic ${saved ? 'fill-current' : ''}`}
            />
            {saved ? 'Saved' : 'Save'}
            <span className="sr-only"> to wishlist</span>
          </button>
        </div>
      </motion.div>
    </motion.header>
  )
}

/** The badge, with what it means in a tooltip on hover, focus or tap. */
function Badge({ label, hint }: { label: string; hint: string }) {
  const id = useId()
  return (
    <span tabIndex={0} aria-describedby={id} className="group relative inline-flex cursor-help rounded-full">
      <Tag>{label}</Tag>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-10 mt-2 inline-flex h-7 w-max items-center rounded-full bg-ink px-3 font-mono text-label tracking-label text-milk uppercase opacity-0 transition-opacity duration-500 ease-cinematic group-hover:opacity-100 group-focus:opacity-100"
      >
        {hint}
      </span>
    </span>
  )
}
