import { collectionById } from '../data/collections'
import type { Amenity, Stay, StayType } from '../data/stays'
import { formatRange, formatShortDate, overlaps } from './dates'
import { priceFormat } from './format'

/** Combined adults + children cap. */
export const MAX_GUESTS = 8
/** Highest "at least N bedrooms" step. */
export const MAX_BEDROOMS = 4

export interface Filters {
  /** Curated collection id, '' for none. */
  collection: string
  query: string
  /** ISO dates (YYYY-MM-DD), empty when unset. */
  checkIn: string
  checkOut: string
  adults: number
  children: number
  /** Only show pet-friendly stays. */
  pets: boolean
  /** Nightly price range in EUR; 0 leaves that end open. */
  priceMin: number
  priceMax: number
  /** Any of these types; empty for all. */
  types: StayType[]
  /** At least this many bedrooms, 0 for any. */
  bedrooms: number
  offGrid: boolean
  instantBook: boolean
  /** Every one of these amenities. */
  amenities: Amenity[]
}

export const DEFAULT_FILTERS: Filters = {
  collection: '',
  query: '',
  checkIn: '',
  checkOut: '',
  adults: 0,
  children: 0,
  pets: false,
  priceMin: 0,
  priceMax: 0,
  types: [],
  bedrooms: 0,
  offGrid: false,
  instantBook: false,
  amenities: [],
}

/** What the search bar's "Clear all" resets; catalogue refinements stay. */
export const SEARCH_BAR_DEFAULTS: Partial<Filters> = {
  query: '',
  checkIn: '',
  checkOut: '',
  adults: 0,
  children: 0,
  pets: false,
}

export const guestCount = (f: Pick<Filters, 'adults' | 'children'>) => f.adults + f.children

/** "2 guests · pet", or '' when nothing is set. */
export function guestSummary(f: Pick<Filters, 'adults' | 'children' | 'pets'>) {
  const n = guestCount(f)
  const parts = n ? [`${n} ${n === 1 ? 'guest' : 'guests'}`] : []
  if (f.pets) parts.push(n ? 'pet' : 'Pet-friendly')
  return parts.join(' · ')
}

/* ─── Types, amenities, price ───────────────────────────────────────────── */

const PLURAL: Record<Stay['type'], string> = {
  Dome: 'Domes',
  'Mirror house': 'Mirror houses',
  'A-frame': 'A-frames',
  Villa: 'Villas',
  Loft: 'Lofts',
  'Floating house': 'Floating houses',
  'Stilt house': 'Stilt houses',
  Treehouse: 'Treehouses',
}

export const STAY_TYPES = Object.keys(PLURAL) as StayType[]

export const AMENITY_LABELS: Record<Amenity, string> = {
  sauna: 'Sauna',
  'hot-tub': 'Hot tub',
  fireplace: 'Fireplace',
  pool: 'Pool',
  workspace: 'Workspace',
  'ev-charger': 'EV charger',
}

export const AMENITIES = Object.keys(AMENITY_LABELS) as Amenity[]

/** Types present in the catalogue, with their stay counts, in `StayType` order. */
export function typeOptions(stays: Stay[]) {
  return STAY_TYPES.map((type) => ({
    type,
    label: PLURAL[type],
    count: stays.filter((s) => s.type === type).length,
  })).filter((o) => o.count > 0)
}

const PRICE_STEP = 50

/** Cheapest and dearest nightly price, widened to the nearest €50. */
export function priceBounds(stays: Stay[]) {
  const prices = stays.map((s) => s.pricePerNight)
  return {
    min: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
    max: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
  }
}

/** "€400–€600", "From €400", "Up to €600", or '' when unset. */
export function priceLabel(f: Pick<Filters, 'priceMin' | 'priceMax'>) {
  const min = f.priceMin && priceFormat.format(f.priceMin)
  const max = f.priceMax && priceFormat.format(f.priceMax)
  if (min && max) return `${min}–${max}`
  if (min) return `From ${min}`
  if (max) return `Up to ${max}`
  return ''
}

/* ─── Destinations ──────────────────────────────────────────────────────── */

export interface Destination {
  kind: 'country' | 'place'
  /** Used as the search query when picked. */
  query: string
  /** "Lapland, Finland" or "Portugal". */
  title: string
  subtitle: string
  /** Words matched against typed text (place, country, ISO code). */
  keywords: string
  /** Thumbnail from one of its stays. */
  image: string
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const listTypes = (group: Stay[]) => {
  const types = [...new Set(group.map((s) => PLURAL[s.type]))]
  const joined = types.length > 1 ? `${types.slice(0, -1).join(', ')} and ${types.at(-1)!.toLowerCase()}` : types[0]
  return joined
}

/**
 * Destinations derived from the stays: every region/city, plus the country
 * itself once it has more than one place. Sorted by country, then place.
 */
export function buildDestinations(stays: Stay[]): Destination[] {
  const byCountry = new Map<string, Stay[]>()
  for (const s of stays) byCountry.set(s.country, [...(byCountry.get(s.country) ?? []), s])

  return [...byCountry.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([country, group]) => {
      const places = [...new Set(group.map((s) => s.location))].sort((a, b) => a.localeCompare(b))
      const code = group[0].countryCode

      const placeItems: Destination[] = places.map((place) => {
        const here = group.filter((s) => s.location === place)
        return {
          kind: 'place',
          query: place,
          title: `${place}, ${country}`,
          // Short keywords: architecture type + the two lead landscape words
          subtitle: [
            here.length === 1 ? here[0].type : listTypes(here),
            ...[...new Set(here.flatMap((s) => s.landscape.slice(0, 2)))].slice(0, 2).map(capitalize),
          ].join(' · '),
          keywords: `${place} ${country} ${code}`,
          image: here[0].image,
        }
      })

      if (places.length < 2) return placeItems
      return [
        {
          kind: 'country',
          query: country,
          title: country,
          subtitle: `${listTypes(group)} · ${places.length} regions`,
          keywords: `${country} ${code}`,
          image: group[0].image,
        },
        ...placeItems,
      ]
    })
}

/* ─── Recent searches ───────────────────────────────────────────────────── */

export type RecentSearch = Pick<Filters, 'query' | 'checkIn' | 'checkOut' | 'adults' | 'children' | 'pets'>

/** "12–17 Oct · 2 guests" / "Any week · Any guests". Past dates read as "Any week". */
export function recentSubtitle(r: RecentSearch, today: string) {
  const dates = r.checkIn && r.checkOut && r.checkIn >= today ? formatRange(r.checkIn, r.checkOut) : 'Any week'
  const n = guestCount(r)
  const guests = n ? `${n} ${n === 1 ? 'guest' : 'guests'}` : 'Any guests'
  return [dates, guests, r.pets && 'pet'].filter(Boolean).join(' · ')
}

/** The filters a recent search restores; dates that are already past are dropped. */
export function recentPatch(r: RecentSearch, today: string): Partial<Filters> {
  const datesValid = r.checkIn && r.checkOut && r.checkIn >= today
  return {
    query: r.query,
    checkIn: datesValid ? r.checkIn : '',
    checkOut: datesValid ? r.checkOut : '',
    adults: r.adults,
    children: r.children,
    pets: r.pets,
  }
}

/* ─── Matching ──────────────────────────────────────────────────────────── */

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export const words = (s: string) => normalize(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean)

const matchesQuery = (stay: Stay, query: string) => {
  const q = words(query)
  if (!q.length) return true
  const haystack = normalize(
    [stay.name, stay.type, stay.location, stay.country, stay.architect, ...stay.landscape].join(' '),
  )
  return q.every((word) => haystack.includes(word))
}

const isAvailable = (stay: Stay, checkIn: string, checkOut: string) =>
  !checkIn || !checkOut || stay.booked.every(([from, to]) => !overlaps(checkIn, checkOut, from, to))

export function filterStays(stays: Stay[], f: Filters) {
  return stays.filter(
    (s) =>
      (!f.collection || (s.collections as string[]).includes(f.collection)) &&
      matchesQuery(s, f.query) &&
      s.guests >= guestCount(f) &&
      (!f.pets || s.petFriendly) &&
      isAvailable(s, f.checkIn, f.checkOut) &&
      (!f.priceMin || s.pricePerNight >= f.priceMin) &&
      (!f.priceMax || s.pricePerNight <= f.priceMax) &&
      (!f.types.length || f.types.includes(s.type)) &&
      s.beds >= f.bedrooms &&
      (!f.offGrid || s.offGrid) &&
      (!f.instantBook || s.instantBook) &&
      f.amenities.every((a) => s.amenities.includes(a)),
  )
}

/* ─── Active filter chips ───────────────────────────────────────────────── */

export type FilterKey =
  | 'collection'
  | 'query'
  | 'dates'
  | 'guests'
  | 'type'
  | 'price'
  | 'bedrooms'
  | 'offGrid'
  | 'instantBook'
  | 'amenity'
  | 'pets'

/** One removable tag; multi-value filters (types, amenities) get one chip per value. */
export interface FilterChip {
  id: string
  key: FilterKey
  value?: string
  label: string
}

export function activeFilters(f: Filters): FilterChip[] {
  const chips: FilterChip[] = []
  const add = (key: FilterKey, label: string, value?: string) =>
    chips.push({ id: value ? `${key}:${value}` : key, key, value, label })
  const n = guestCount(f)
  const collection = collectionById(f.collection)
  if (collection) add('collection', collection.title)
  if (f.query.trim()) add('query', `“${f.query.trim()}”`)
  if (f.checkIn && f.checkOut) add('dates', `${formatShortDate(f.checkIn)} → ${formatShortDate(f.checkOut)}`)
  if (n) add('guests', `${n} ${n === 1 ? 'guest' : 'guests'}`)
  for (const type of f.types) add('type', type, type)
  if (f.priceMin || f.priceMax) add('price', priceLabel(f))
  if (f.bedrooms) add('bedrooms', `${f.bedrooms}+ ${f.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`)
  if (f.offGrid) add('offGrid', 'Off-grid')
  if (f.instantBook) add('instantBook', 'Instant book')
  for (const amenity of f.amenities) add('amenity', AMENITY_LABELS[amenity], amenity)
  if (f.pets) add('pets', 'Pet-friendly')
  return chips
}

export function clearFilter(f: Filters, { key, value }: Pick<FilterChip, 'key' | 'value'>): Filters {
  switch (key) {
    case 'collection':
      return { ...f, collection: '' }
    case 'query':
      return { ...f, query: '' }
    case 'dates':
      return { ...f, checkIn: '', checkOut: '' }
    case 'guests':
      return { ...f, adults: 0, children: 0 }
    case 'type':
      return { ...f, types: f.types.filter((t) => t !== value) }
    case 'price':
      return { ...f, priceMin: 0, priceMax: 0 }
    case 'bedrooms':
      return { ...f, bedrooms: 0 }
    case 'offGrid':
      return { ...f, offGrid: false }
    case 'instantBook':
      return { ...f, instantBook: false }
    case 'amenity':
      return { ...f, amenities: f.amenities.filter((a) => a !== value) }
    case 'pets':
      return { ...f, pets: false }
  }
}

/** Refinements set in the filter bar and the "All filters" sheet (its badge). */
export function refinementCount(f: Filters) {
  return (
    (f.priceMin || f.priceMax ? 1 : 0) +
    f.types.length +
    (guestCount(f) ? 1 : 0) +
    (f.bedrooms ? 1 : 0) +
    Number(f.offGrid) +
    Number(f.instantBook) +
    f.amenities.length +
    Number(f.pets)
  )
}

/** Clears every catalogue refinement, keeping destination, collection and dates. */
export const clearRefinements = (f: Filters): Filters => ({
  ...DEFAULT_FILTERS,
  collection: f.collection,
  query: f.query,
  checkIn: f.checkIn,
  checkOut: f.checkOut,
})

/* ─── URL ───────────────────────────────────────────────────────────────── */

const ISO = /^\d{4}-\d{2}-\d{2}$/
const count = (v: string | null, max: number) => Math.min(max, Math.max(0, Number.parseInt(v ?? '', 10) || 0))
const oneOf = <T extends string>(values: string[], allowed: readonly T[]) =>
  [...new Set(values)].filter((v): v is T => (allowed as readonly string[]).includes(v))

/** Filters → "?query=Lapland&checkIn=…" (defaults omitted, so an empty search is "/search"). */
export function filtersToSearch(f: Filters) {
  const p = new URLSearchParams()
  if (f.collection) p.set('collection', f.collection)
  if (f.query.trim()) p.set('query', f.query.trim())
  // A lone check-in is kept too: on /search the URL is the state, and a half-picked
  // range must survive the round trip while the visitor chooses check-out
  if (f.checkIn) p.set('checkIn', f.checkIn)
  if (f.checkIn && f.checkOut) p.set('checkOut', f.checkOut)
  if (f.adults) p.set('adults', String(f.adults))
  if (f.children) p.set('children', String(f.children))
  if (f.pets) p.set('pets', '1')
  if (f.priceMin) p.set('priceMin', String(f.priceMin))
  if (f.priceMax) p.set('priceMax', String(f.priceMax))
  for (const type of f.types) p.append('type', type)
  if (f.bedrooms) p.set('beds', String(f.bedrooms))
  if (f.offGrid) p.set('offGrid', '1')
  if (f.instantBook) p.set('instant', '1')
  for (const amenity of f.amenities) p.append('amenity', amenity)
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

/** Parses and sanitises URL params; anything invalid falls back to its default. */
export function filtersFromSearch(params: URLSearchParams): Filters {
  const checkIn = params.get('checkIn') ?? ''
  const checkOut = params.get('checkOut') ?? ''
  const checkInValid = ISO.test(checkIn)
  // Check-out only counts after a valid check-in; a range in progress has none yet
  const checkOutValid = checkInValid && ISO.test(checkOut) && checkIn < checkOut
  const collection = params.get('collection') ?? ''
  const children = count(params.get('children'), MAX_GUESTS)
  const adults = Math.max(children ? 1 : 0, count(params.get('adults'), MAX_GUESTS - children))
  const priceMin = count(params.get('priceMin'), 100_000)
  const priceMax = count(params.get('priceMax'), 100_000)
  // A reversed range keeps only its lower end
  const rangeValid = !priceMin || !priceMax || priceMin <= priceMax
  return {
    collection: collectionById(collection) ? collection : '',
    query: params.get('query') ?? '',
    checkIn: checkInValid ? checkIn : '',
    checkOut: checkOutValid ? checkOut : '',
    adults,
    children,
    pets: params.get('pets') === '1',
    priceMin,
    priceMax: rangeValid ? priceMax : 0,
    types: oneOf(params.getAll('type'), STAY_TYPES),
    bedrooms: count(params.get('beds'), MAX_BEDROOMS),
    offGrid: params.get('offGrid') === '1',
    instantBook: params.get('instant') === '1',
    amenities: oneOf(params.getAll('amenity'), AMENITIES),
  }
}
