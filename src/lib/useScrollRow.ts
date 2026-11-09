import { useEffect, useRef, useState, type FocusEvent } from 'react'

/** Where a horizontal row is: share of it in view, how far along, and whether it can page either way. */
export interface ScrollRowState {
  progress: number
  visible: number
  atStart: boolean
  atEnd: boolean
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A CSS scroll-snap row (no carousel library): tracks the scroll position for the arrows and the
 * progress line, pages by one item, and scrolls a focused item into view.
 */
export function useScrollRow<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [state, setState] = useState<ScrollRowState>({ progress: 0, visible: 1, atStart: true, atEnd: false })

  // Arrows and the progress hairline follow the scroll position and the track size
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setState({
        progress: max > 0 ? el.scrollLeft / max : 0,
        visible: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
        atStart: el.scrollLeft <= 2,
        atEnd: el.scrollLeft >= max - 2,
      })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const resize = new ResizeObserver(update)
    resize.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      resize.disconnect()
    }
  }, [])

  /** Scrolls by one item (its width plus the row gap). */
  const page = (dir: 1 | -1) => {
    const el = ref.current
    const item = el?.querySelector<HTMLElement>('li')
    if (!el || !item) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: dir * (item.offsetWidth + gap), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  /** `onFocus` for an item: tabbing onto it brings the whole item into view (snap then aligns it). */
  const reveal = (e: FocusEvent<HTMLElement>) => {
    e.currentTarget.scrollIntoView({
      inline: 'nearest',
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return { ref, state, page, reveal }
}
