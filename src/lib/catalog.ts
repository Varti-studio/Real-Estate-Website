import type { Stay } from '../data/stays'
import { filtersToSearch, type Filters } from './filters'

/**
 * Catalogue view state on /search: sort, pagination and map geometry.
 * Pure — no React. Sort and page live in the URL beside the filters.
 */

/* ─── Sort ──────────────────────────────────────────────────────────────── */

export const SORTS = ['curated', 'price', 'newest'] as const
export type SortKey = (typeof SORTS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  curated: 'Curated',
  price: 'Price',
  newest: 'Newest',
}

/** Curated = our order (`index`), price = cheapest first, newest = latest `listed`. */
export function sortStays(stays: Stay[], sort: SortKey) {
  const sorted = [...stays]
  switch (sort) {
    case 'curated':
      return sorted.sort((a, b) => a.index.localeCompare(b.index))
    case 'price':
      return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight)
    case 'newest':
      return sorted.sort((a, b) => b.listed.localeCompare(a.listed))
  }
}

/* ─── Pagination ────────────────────────────────────────────────────────── */

export const PAGE_SIZE = 6

export const pageCount = (items: number) => Math.max(1, Math.ceil(items / PAGE_SIZE))

export const paginate = <T>(items: T[], page: number) => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

/**
 * Page buttons with gaps, e.g. `1 2 3 … 18` or `1 … 7 8 9 … 18`.
 * Up to 7 pages are all listed.
 */
export function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const shown = new Set([1, total, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((p) => shown.add(p))
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => shown.add(p))
  const pages = [...shown].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return pages.flatMap((p, i) => (i && p - pages[i - 1] > 1 ? ['gap' as const, p] : [p]))
}

/* ─── Map geometry ──────────────────────────────────────────────────────── */

/** `[lng, lat]` from "64.2559° N · 21.1299° W". */
export function parseCoordinates(coordinates: string): [number, number] {
  const match = coordinates.match(/([\d.]+)°\s*([NS])\s*·\s*([\d.]+)°\s*([EW])/)
  if (!match) return [0, 0]
  const [, lat, ns, lng, ew] = match
  return [Number(lng) * (ew === 'W' ? -1 : 1), Number(lat) * (ns === 'S' ? -1 : 1)]
}

export interface Bounds {
  west: number
  south: number
  east: number
  north: number
}

export function withinBounds(stay: Stay, b: Bounds) {
  const [lng, lat] = parseCoordinates(stay.coordinates)
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east
}

/* ─── URL ───────────────────────────────────────────────────────────────── */

export interface CatalogState {
  sort: SortKey
  page: number
}

export function catalogFromSearch(params: URLSearchParams): CatalogState {
  const sort = params.get('sort') ?? ''
  return {
    sort: (SORTS as readonly string[]).includes(sort) ? (sort as SortKey) : 'curated',
    page: Math.max(1, Number.parseInt(params.get('page') ?? '', 10) || 1),
  }
}

/** Full /search URL; defaults (curated, page 1) are omitted. */
export function searchUrl(filters: Filters, { sort, page }: CatalogState) {
  const p = new URLSearchParams(filtersToSearch(filters))
  if (sort !== 'curated') p.set('sort', sort)
  if (page > 1) p.set('page', String(page))
  const qs = p.toString()
  return `/search${qs ? `?${qs}` : ''}`
}
