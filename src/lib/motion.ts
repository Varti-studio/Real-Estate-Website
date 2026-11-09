import type { Transition, Variants } from 'framer-motion'

/** Expo-out curve — the single easing for the whole product. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Durations in seconds. */
export const DURATION = {
  micro: 0.4,
  ui: 0.7,
  reveal: 1.1,
  image: 1.4,
  hero: 1.8,
} as const

/** Stagger steps in seconds. */
export const STAGGER = {
  tight: 0.06,
  base: 0.12,
  loose: 0.18,
} as const

export const transition = (
  duration: number = DURATION.ui,
  delay = 0,
): Transition => ({ duration, delay, ease: EASE })

/** Parent that staggers its children. */
export const staggerContainer = (
  stagger: number = STAGGER.base,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
})

/** Line mask reveal: rises from below with a soft blur. Wrap in overflow-hidden. */
export const lineReveal: Variants = {
  hidden: { y: '110%', opacity: 0, filter: 'blur(12px)' },
  visible: {
    y: '0%',
    opacity: 1,
    filter: 'blur(0px)',
    transition: transition(DURATION.reveal),
  },
}

/** Generic entry for blocks, cards, sections. */
export const fadeUp: Variants = {
  hidden: { y: 24, opacity: 0, filter: 'blur(6px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: transition(DURATION.reveal),
  },
}

/** Plain fade — for overlays and secondary details. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition(DURATION.ui) },
}

/** Success mark: the ink circle settles from 0.6 (no overshoot), then its tick draws itself. */
export const markCircle: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: transition(DURATION.ui) },
}
export const markTick: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: transition(DURATION.ui, DURATION.micro) },
}

/** Default in-view settings for scroll reveals. */
export const inView = { once: true, margin: '-10% 0px' } as const
