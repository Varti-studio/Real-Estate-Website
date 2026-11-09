import { useEffect, useState, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/**
 * Minimal History-API router — three pages don't warrant a dependency.
 * Vite's dev server and `vite preview` both fall back to index.html for deep links.
 */

const EVENT = 'solum:navigate'

/** The deploy's base path ('' in dev, '/Real-Estate-Website' on GitHub Pages). Routes stay base-less. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const withBase = (to: string) => BASE + to
const stripBase = (path: string) =>
  BASE && (path === BASE || path.startsWith(BASE + '/')) ? path.slice(BASE.length) || '/' : path

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

const snapshot = () => stripBase(window.location.pathname) + window.location.search

export function useLocation() {
  const href = useSyncExternalStore(subscribe, snapshot)
  const url = new URL(href, window.location.origin)
  return { pathname: url.pathname, search: url.search, params: url.searchParams }
}

/** `replace` edits the current entry (live filter changes) and keeps the scroll position. */
export function navigate(to: string, { replace = false } = {}) {
  if (to === snapshot()) return
  window.history[replace ? 'replaceState' : 'pushState'](null, '', withBase(to))
  window.dispatchEvent(new Event(EVENT))
  if (!replace) window.scrollTo({ top: 0 })
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Home sections that other pages link to for reference (the FAQ and
 * cancellation policy). Linked from a page that doesn't have them, they open
 * in a sheet on that page (`InfoSheet`), so nobody is taken off the page they
 * were on.
 */
export const INFO_SECTIONS = ['faq'] as const
export type InfoSection = (typeof INFO_SECTIONS)[number]
const INFO_EVENT = 'solum:info'
const isInfoSection = (hash: string): hash is InfoSection => (INFO_SECTIONS as readonly string[]).includes(hash)

/** The info sheet asked for by the last `goTo`, as `[section, close]`. */
export function useInfoSheet(): [InfoSection | null, () => void] {
  const [section, setSection] = useState<InfoSection | null>(null)
  useEffect(() => {
    const onOpen = (e: Event) => setSection((e as CustomEvent<InfoSection>).detail)
    window.addEventListener(INFO_EVENT, onOpen)
    return () => window.removeEventListener(INFO_EVENT, onOpen)
  }, [])
  return [section, () => setSection(null)]
}

/**
 * Goes to a page or a section ("/#collections"). A section already on this
 * page (the footer's "/#list-your-home" is on every page) is scrolled to; an
 * info section this page lacks opens in a sheet; anything else navigates
 * first, then scrolls.
 */
export function goTo(to: string) {
  const [path, hash] = to.split('#')
  if (!hash) return navigate(to)
  const scroll = () =>
    document.getElementById(hash)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' })
  if (document.getElementById(hash)) return scroll()
  if (isInfoSection(hash)) return void window.dispatchEvent(new CustomEvent(INFO_EVENT, { detail: hash }))
  navigate(path)
  requestAnimationFrame(() => requestAnimationFrame(scroll))
}

/**
 * Client-side navigation for a plain or motion anchor's click; modified clicks
 * (new tab, etc.) behave natively.
 */
export function linkClick(e: MouseEvent<HTMLAnchorElement>, to: string) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  navigate(to)
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** Anchor that navigates client-side. */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    linkClick(e, to)
  }
  return <a href={withBase(to)} onClick={handle} {...rest} />
}
