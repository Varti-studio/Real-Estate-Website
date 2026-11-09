import { useRef, type MouseEvent } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { EMAIL } from '../data/copy'
import { unsplash } from '../data/stays'
import { DEFAULT_FILTERS, filtersToSearch, type Filters } from '../lib/filters'
import { DURATION, STAGGER, fadeUp, inView, staggerContainer, transition } from '../lib/motion'
import { Link, goTo } from '../lib/router'
import { NBSP, typeset } from '../lib/typography'
import { ImageWithFallback } from './ui/ImageWithFallback'
import { Logo } from './ui/Logo'
import { MonoLabel } from './ui/MonoLabel'

/*
 * The site footer, after an editorial gallery reference: a light host CTA
 * (headline with an inline pill, ink-on-sand), a wide interior photo, and an
 * ink block of link columns. Rendered once in App.tsx, so it closes every page.
 */

/** There is no host application flow yet, so hosts write to us. */
const HOST_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('List my home')}`

/** Casa Monolite's main room (its `detail` photo in stays.ts), at banner width. */
const PHOTO_ID = '1774516534068-77422d9226e6'
const PHOTO = {
  src: unsplash(PHOTO_ID, 2400),
  srcSet: [1200, 1800, 2400].map((w) => `${unsplash(PHOTO_ID, w)} ${w}w`).join(', '),
  alt: 'A concrete room with floor-to-ceiling windows onto rocks and water',
}

const searchFor = (patch: Partial<Filters>) => `/search${filtersToSearch({ ...DEFAULT_FILTERS, ...patch })}`

/** A footer link: a page, a home section ("/#trust"), an external or mailto href, or plain text until it has a page (no `to`). */
type FooterLinkItem = { label: string; to?: string }

/** No social accounts, journal, privacy or terms pages yet: those entries are plain text, not links. */
const COLUMNS: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: 'Architecture',
    links: [
      { label: 'Domes & treehouses', to: searchFor({ types: ['Dome', 'Treehouse'] }) },
      { label: 'Cliff & monoliths', to: searchFor({ collection: 'cliff' }) },
      { label: 'Off-grid homes', to: searchFor({ offGrid: true }) },
      { label: 'How we check homes', to: '/#trust' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Instagram' },
      { label: 'X (Twitter)' },
      { label: 'Journal' },
      { label: 'Email us', to: `mailto:${EMAIL}` },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy' },
      { label: 'Terms of stay' },
      { label: 'Cancellation policy', to: '/#faq' },
    ],
  },
]

/** The pill pops in once the headline around it has started to settle. */
const pillReveal: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: transition(DURATION.ui, DURATION.micro) },
}

export function FooterEditorial() {
  return (
    <footer className="container-x pb-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="relative isolate overflow-hidden rounded-frame"
      >
        <HostCta />
        <PhotoBanner />
        <LinkBlock />
      </motion.div>
    </footer>
  )
}

/* ─── 1. Light host CTA ─────────────────────────────────────────────────── */

/** The classic footer's host CTA, set ink-on-sand: headline with an inline pill, a paragraph to the right. */
function HostCta() {
  return (
    <section id="list-your-home" aria-labelledby="editorial-host-title" className="scroll-mt-6 bg-sand text-ink">
      <motion.div
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        // The second row needs ~70% of the band, so the paragraph sits beside it from xl and below it before.
        // Beside it, the paragraph's last line shares the headline's last baseline.
        className="flex flex-col gap-10 px-5 py-10 md:px-10 md:py-12 lg:py-16 xl:flex-row xl:items-baseline-last xl:justify-between"
      >
        {/* The label carries the plain sentence; the pill inside stays a normal, focusable link */}
        <motion.h2
          id="editorial-host-title"
          aria-label="Own a designer home? Rent it out with Solum."
          variants={fadeUp}
          className="min-w-0 text-h2 font-light xl:shrink-0"
        >
          {/* From lg two fixed rows: the question, then the offer with the pill set into it */}
          <span className="lg:block">Own a designer{NBSP}<span className="accent">home</span>?</span>{' '}
          <span className="lg:block lg:whitespace-nowrap">
            {/* Kept together from sm; on a phone the pair is wider than the screen */}
            <span className="sm:whitespace-nowrap">
              <span className="text-stone-500">Rent it out</span> <HostPill />
            </span>{' '}
            {`with${NBSP}Solum.`}
          </span>
        </motion.h2>

        <motion.p variants={fadeUp} className="max-w-sm text-body leading-[1.55] text-graphite-600 xl:max-w-xs">
          {typeset('We work with owners and architects of unique homes. We check every listing in person before it goes live.')}
        </motion.p>
      </motion.div>
    </section>
  )
}

/** Pill set into the headline, inverted for the light band. Framer owns the reveal (outer span), CSS the hover (the link). */
function HostPill() {
  return (
    // `align-middle` centres on the x-height; the lift (top, so Framer keeps transform) centres it on the
    // capitals. Only from sm, where the pill shares its line; on a phone it wraps onto a line of its own.
    <motion.span variants={pillReveal} className="relative my-1 inline-block align-middle sm:-top-[0.18em]">
      <a
        href={HOST_HREF}
        className="group/pill inline-flex h-11 items-center gap-3 rounded-full bg-ink pr-1.5 pl-4 text-milk transition-[scale,background-color] duration-700 ease-cinematic hover:scale-[1.04] hover:bg-graphite-800 focus-visible:scale-[1.04] focus-visible:bg-graphite-800 md:h-13 lg:h-16 lg:gap-4 lg:pr-2 lg:pl-6"
      >
        <span className="font-mono text-label leading-none tracking-label whitespace-nowrap uppercase">
          List your home
        </span>
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-milk text-ink md:size-10 lg:size-12">
          <ArrowRight
            size={18}
            strokeWidth={1.5}
            className="transition-transform duration-700 ease-cinematic group-hover/pill:-rotate-45 group-focus-visible/pill:-rotate-45"
          />
        </span>
      </a>
    </motion.span>
  )
}

/* ─── 2. Photo banner ───────────────────────────────────────────────────── */

/** The interior drifts against the scroll; still under reduced motion. */
function PhotoBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden bg-sand sm:aspect-[21/9] lg:aspect-auto lg:h-112">
      {/* Taller than the frame, so the drift never shows an edge */}
      <motion.div style={{ y: reduceMotion ? 0 : y }} className="absolute inset-x-0 -inset-y-[10%] will-change-transform">
        <ImageWithFallback
          src={PHOTO.src}
          srcSet={PHOTO.srcSet}
          sizes="(min-width: 1680px) 1600px, 100vw"
          alt={PHOTO.alt}
          loading="lazy"
          wrapperClassName="h-full w-full"
        />
      </motion.div>
    </div>
  )
}

/* ─── 3. Ink link block ─────────────────────────────────────────────────── */

const LINK =
  'text-body text-milk/60 transition-colors duration-500 ease-cinematic hover:text-milk focus-visible:text-milk'

function FooterLink({ label, to }: FooterLinkItem) {
  if (!to) return <span className="text-body text-milk/60">{label}</span>
  if (to.startsWith('mailto:')) return <a href={to} className={LINK}>{label}</a>
  if (!to.includes('#')) return <Link to={to} className={LINK}>{label}</Link>

  // Sections: goTo scrolls if this page has it, opens About / FAQ in a sheet elsewhere, else navigates home
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    goTo(to)
  }
  return <a href={to} onClick={onClick} className={LINK}>{label}</a>
}

function LinkBlock() {
  return (
    <motion.div
      variants={staggerContainer(STAGGER.base)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      className="bg-ink px-5 pt-12 pb-8 text-milk md:px-10 lg:pt-16"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
        <motion.div variants={fadeUp} className="lg:col-span-6">
          <Logo light />
        </motion.div>

        <motion.nav
          aria-label="Footer"
          variants={fadeUp}
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-6"
        >
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-milk/50">{col.title}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.nav>
      </div>

      <motion.div variants={fadeUp} className="mt-16 lg:mt-24">
        <MonoLabel className="leading-[1.6] text-milk/50">© 2026 Solum. All rights reserved.</MonoLabel>
      </motion.div>
    </motion.div>
  )
}
