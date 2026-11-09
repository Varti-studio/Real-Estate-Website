import { ADDRESS_NOTE, CANCELLATION, CHECK_IN, CONFIRMATION, GUEST_FAVOURITE, HOUSE_TIMES, OFF_GRID, PETS } from '../data/copy'
import { reflections } from '../data/reflections'
import { stayStories, type StayAmenity, type StayStory } from '../data/stayStories'
import { stays, type Amenity, type Stay } from '../data/stays'
import { DEFAULT_FILTERS, filtersFromSearch, filtersToSearch, type Filters } from './filters'

/* ─── URL ───────────────────────────────────────────────────────────────── */

/** The search fields a stay page carries: dates and guests. */
export type StayParams = Pick<Filters, 'checkIn' | 'checkOut' | 'adults' | 'children' | 'pets'>

const pickParams = (f: Partial<Filters>): StayParams => ({
  checkIn: f.checkIn ?? '',
  checkOut: f.checkOut ?? '',
  adults: f.adults ?? 0,
  children: f.children ?? 0,
  pets: f.pets ?? false,
})

/** "/stays/canopy-treehouse?checkIn=…&adults=2"; only dates and guests travel along. */
export const stayUrl = (id: string, f: Partial<Filters> = {}) =>
  `/stays/${id}${filtersToSearch({ ...DEFAULT_FILTERS, ...pickParams(f) })}`

/** "/stays/canopy-treehouse/checkout?checkIn=…": the same dates and guests, one step on. */
export const checkoutUrl = (id: string, f: Partial<Filters> = {}) =>
  `/stays/${id}/checkout${filtersToSearch({ ...DEFAULT_FILTERS, ...pickParams(f) })}`

export const isCheckoutPath = (pathname: string) => /^\/stays\/[^/]+\/checkout\/?$/.test(pathname)

/** Dates and guests from a stay page's query string (validated like /search). */
export const stayParamsFromSearch = (params: URLSearchParams) => pickParams(filtersFromSearch(params))

/** "/stays/<id>" (or its "/checkout") → the stay, or undefined for an unknown id. */
export function stayFromPath(pathname: string) {
  const id = decodeURIComponent(pathname.replace(/^\/stays\//, '').replace(/\/$/, '').replace(/\/checkout$/, ''))
  return stays.find((s) => s.id === id)
}

/* ─── Story ─────────────────────────────────────────────────────────────── */

type Host = { name: string; since: number; responds: string; phone?: string; photo?: string }
type Badge = { label: string; hint: string }

/** A stay page's content: every field filled, the host complete, and the badge it earned (if any). */
export type Story = Required<Omit<StayStory, 'host' | 'unavailable'>> & { host: Host; badge: Badge | null }

const CATALOGUE_AMENITIES: Record<Amenity, StayAmenity> = {
  sauna: { icon: 'sauna', label: 'Private sauna', group: 'Wellness' },
  'hot-tub': { icon: 'hottub', label: 'Hot tub under the sky', group: 'Wellness' },
  fireplace: { icon: 'fireplace', label: 'Wood-burning fireplace', group: 'Living' },
  pool: { icon: 'pool', label: 'Outdoor pool', group: 'Outdoors' },
  workspace: { icon: 'workspace', label: 'Dedicated workspace', group: 'Work' },
  'ev-charger': { icon: 'ev', label: 'EV charger', group: 'Outdoors' },
}

/** What every Solum stay has, after its own amenities (a story's `unavailable` leaves some out). */
const BASE_AMENITIES: StayAmenity[] = [
  { icon: 'glass', label: 'Panoramic glazing', group: 'Living' },
  { icon: 'linen', label: 'Organic linen bedding', group: 'Living' },
  { icon: 'wifi', label: 'Wi-Fi', group: 'Work' },
  { icon: 'kitchen', label: 'Equipped kitchen', group: 'Kitchen' },
  { icon: 'coffee', label: 'Pour-over coffee kit', group: 'Kitchen' },
  { icon: 'shower', label: 'Rain shower', group: 'Wellness' },
  { icon: 'heating', label: 'Underfloor heating', group: 'Living' },
  { icon: 'books', label: 'Architecture library', group: 'Living' },
  { icon: 'parking', label: 'Free parking', group: 'Outdoors' },
  { icon: 'smoke', label: 'Smoke alarm', group: 'Safety' },
  { icon: 'firstaid', label: 'First aid kit', group: 'Safety' },
]

const clampScore = (n: number) => Math.min(10, Math.round(n * 10) / 10)

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/**
 * One bed per bedroom: doubles until every guest has a place, and a single in
 * the last room when the guest count is odd. Rooms past the second share a
 * card (there are only two photos to go round), so the cards always add up to
 * the bedroom count in the header.
 */
function sleepFor(stay: Stay): Story['sleep'] {
  const beds = Array.from({ length: stay.beds }, (_, i) => (stay.guests - 2 * i >= 2 ? 'double' : 'single'))
  const bedList = (list: string[]) =>
    (['double', 'single'] as const)
      .map((kind) => list.filter((b) => b === kind).length)
      .flatMap((n, k) => (n ? [count(n, `${k ? 'single' : 'double'} bed`, `${k ? 'single' : 'double'} beds`)] : []))
      .join(' · ')
  const photo = (i: number) => {
    const source = i > 0 && stay.detail ? stay.detail : stay
    return { image: source.image.replace(/w=\d+/, 'w=800'), alt: source.alt }
  }

  if (beds.length === 1) return [{ title: 'Bedroom', detail: bedList(beds), ...photo(0) }]
  const rest = beds.slice(1)
  return [
    { title: 'Bedroom 1', detail: bedList(beds.slice(0, 1)), ...photo(0) },
    {
      title: rest.length === 1 ? 'Bedroom 2' : `Bedrooms 2–${beds.length}`,
      detail: bedList(rest),
      ...photo(1),
    },
  ]
}

/** A stay's full page content: its story where written, generated defaults elsewhere. */
export function storyFor(stay: Stay): Story {
  const own = stayStories[stay.id] ?? {}
  const host: Host = {
    name: 'Your host',
    since: Number(stay.listed.slice(0, 4)),
    responds: 'Replies within a day',
    ...own.host,
  }
  const photos = [
    { image: stay.image.replace(/w=\d+/, 'w=2000'), alt: stay.alt, caption: stay.excerpt },
    ...(stay.detail ? [{ image: stay.detail.image, alt: stay.detail.alt, caption: stay.detail.caption }] : []),
  ]
  const unavailable = new Set(own.unavailable ?? [])

  const defaults: Story = {
    headline: `${stay.name}, *${stay.location}*`,
    badge: stay.rating >= GUEST_FAVOURITE.minRating ? { label: GUEST_FAVOURITE.label, hint: GUEST_FAVOURITE.hint } : null,
    region: stay.location,
    host,
    rooms: {
      bedrooms: stay.beds,
      beds: count(stay.beds, 'bed', 'beds'),
      baths: count(Math.max(1, Math.ceil(stay.beds / 2)), 'bath', 'baths'),
    },
    standards: [
      { icon: 'key', title: CHECK_IN.title, body: CHECK_IN.body(host.name) },
      stay.instantBook
        ? { icon: 'zap', ...CONFIRMATION.instant }
        : { icon: 'shield', title: CONFIRMATION.request.title, body: CONFIRMATION.request.body(host.name) },
      stay.offGrid
        ? { icon: 'sun', ...OFF_GRID }
        : stay.petFriendly
          ? { icon: 'paw', ...PETS.yes }
          : { icon: 'paw', ...PETS.no },
    ],
    about: [
      stay.excerpt,
      `${/^[aeiou]/i.test(stay.type) ? 'An' : 'A'} ${stay.type.toLowerCase()} of ${stay.area} m² for up to ${count(stay.guests, 'guest', 'guests')}, designed by ${stay.architect}.`,
    ],
    photos,
    // Only what the house has: a missing amenity is left out, not struck through
    amenities: [...stay.amenities.map((a) => CATALOGUE_AMENITIES[a]), ...BASE_AMENITIES].filter((a) => !unavailable.has(a.icon)),
    sleep: sleepFor(stay),
    scores: {
      silence: clampScore(stay.rating + 0.2),
      design: clampScore(stay.rating + 0.1),
      cleanliness: clampScore(stay.rating),
      location: clampScore(stay.rating - 0.1),
    },
    reviews: [],
    locationNote: `${stay.location}, ${stay.country}. ${ADDRESS_NOTE}`,
    bufferMetres: 250,
    nearby: [],
    rules: {
      house: [...HOUSE_TIMES, `${stay.guests} guests maximum`, PETS.rule(stay.petFriendly), 'Quiet hours 22:00–08:00', 'No smoking'],
      safety: ['Smoke alarm installed', 'Carbon monoxide alarm installed', 'First aid kit on site'],
      cancellation: CANCELLATION.rules,
    },
    cleaningFee: Math.round(stay.pricePerNight * 0.2 / 5) * 5,
    taxRate: 0,
    minNights: 2,
    arrival: { point: `${stay.location}, ${stay.country}`, steps: CHECK_IN.arrival },
  }

  // The review featured in (06) Reflections leads, then the stay's own; a guest appears once
  const featured = reflections
    .filter((r) => r.stayId === stay.id)
    .map(({ guest, city, stayed, rating, quote }) => ({ guest, city, stayed, rating, quote }))
  const reviews = [...featured, ...(own.reviews ?? [])].filter(
    (review, i, all) => all.findIndex((r) => r.guest === review.guest) === i,
  )

  const { host: _host, unavailable: _unavailable, ...rest } = own
  return { ...defaults, ...rest, host, reviews }
}

/** "Canopy Treehouse above the *Aurland* valley" → plain text (titles, labels). */
export const plainText = (s: string) => s.replace(/\*/g, '')
