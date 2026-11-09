import type { StayReview } from '../data/stayStories'
import type { Amenity, Stay } from '../data/stays'
import { todayISO } from './dates'
import type { Story } from './stay'

/**
 * A stay's full review history for the "Show all reviews" sheet: the written
 * reviews first (its (06) Reflections quote and `story.reviews`), then
 * generated ones up to `stay.reviews`, newest first.
 *
 * Mock data until reviews come from a backend. Every generated sentence is
 * built from the stay's own facts (landscape, amenities, host, off-grid,
 * pets, type, architect), so nothing claims what the house doesn't have.
 * Seeded by the stay id: the same stay always reads the same reviews.
 */
export function reviewsFor(stay: Stay, story: Story): StayReview[] {
  const written = story.reviews
  const missing = Math.max(0, stay.reviews - written.length)
  if (!missing) return written

  const random = seeded(stay.id)
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)]

  const openers = openersFor(stay)
  const facts = factsFor(stay, story)
  const months = monthsBetween(stay.listed, todayISO())

  const usedNames = new Set(written.map((r) => r.guest))
  const usedQuotes = new Set<string>()
  const generated: StayReview[] = []

  for (let i = 0; i < missing; i++) {
    let guest = ''
    do guest = `${pick(FIRST_NAMES)} ${pick(INITIALS)}.`
    while (usedNames.has(guest))
    usedNames.add(guest)

    // One opener (it carries the accent) and one or two facts; avoid repeating a whole quote
    let quote = ''
    for (let tries = 0; tries < 12; tries++) {
      const first = pick(facts)
      const second = random() < 0.45 ? pick(facts.filter((f) => f !== first)) : ''
      quote = [pick(openers), first, second].filter(Boolean).join(' ')
      if (!usedQuotes.has(quote)) break
    }
    usedQuotes.add(quote)

    const rating = Math.min(10, Math.max(8.6, Math.round((stay.rating + pick(RATING_DRIFT)) * 10) / 10))
    generated.push({ guest, city: pick(CITIES), stayed: pick(months), rating, quote })
  }

  generated.sort((a, b) => b.stayed.localeCompare(a.stayed))
  return [...written, ...generated]
}

/* ─── Sentences ─────────────────────────────────────────────────────────── */

type Scene = 'water' | 'forest' | 'mountain' | 'sky' | 'snow' | 'mist' | 'desert' | 'city' | 'fields'

/** Landscape keyword → scene and the noun the sentences use. Keywords with no safe sentence are left out. */
const SCENES: Record<string, { scene: Scene; noun: string }> = {
  lake: { scene: 'water', noun: 'lake' },
  fjord: { scene: 'water', noun: 'fjord' },
  water: { scene: 'water', noun: 'water' },
  lagoon: { scene: 'water', noun: 'lagoon' },
  sea: { scene: 'water', noun: 'sea' },
  ocean: { scene: 'water', noun: 'ocean' },
  beach: { scene: 'water', noun: 'sea' },
  coast: { scene: 'water', noun: 'sea' },
  river: { scene: 'water', noun: 'river' },
  forest: { scene: 'forest', noun: 'trees' },
  pine: { scene: 'forest', noun: 'pines' },
  birch: { scene: 'forest', noun: 'birches' },
  mountain: { scene: 'mountain', noun: 'mountains' },
  alpine: { scene: 'mountain', noun: 'peaks' },
  valley: { scene: 'mountain', noun: 'valley' },
  cliff: { scene: 'mountain', noun: 'cliffs' },
  granite: { scene: 'mountain', noun: 'granite' },
  atlas: { scene: 'mountain', noun: 'Atlas' },
  'lava field': { scene: 'mountain', noun: 'lava field' },
  'northern lights': { scene: 'sky', noun: 'northern lights' },
  stars: { scene: 'sky', noun: 'stars' },
  arctic: { scene: 'snow', noun: 'snow' },
  snow: { scene: 'snow', noun: 'snow' },
  fog: { scene: 'mist', noun: 'fog' },
  mist: { scene: 'mist', noun: 'mist' },
  desert: { scene: 'desert', noun: 'desert' },
  sandstone: { scene: 'desert', noun: 'sandstone' },
  city: { scene: 'city', noun: 'city' },
  urban: { scene: 'city', noun: 'city' },
  meadow: { scene: 'fields', noun: 'meadow' },
  terraces: { scene: 'fields', noun: 'terraces' },
  'rice fields': { scene: 'fields', noun: 'rice fields' },
}

/**
 * Openers carry the review's one `*accent*`. `{n}` is the landscape noun; every
 * sentence reads right with a singular or plural noun.
 */
const SCENE_OPENERS: Record<Scene, string[]> = {
  water: [
    'We were down by the {n} every morning before *breakfast*.',
    'You can hear the {n} from the bed at *night*.',
    'We spent most evenings outside, watching the light go off the *{n}*.',
    'The walk to the {n} takes two minutes and became our *routine*.',
  ],
  forest: [
    'The {n} come right up to the glass, so the house feels like part of the *forest*.',
    'We walked through the {n} every morning and met no one for *days*.',
    'You wake to the {n} moving in the wind and very little *else*.',
    'The paths through the {n} start at the door, no car *needed*.',
  ],
  mountain: [
    'Every window frames the {n}, and the view changes by the *hour*.',
    'Breakfast facing the {n} is reason enough to *come*.',
    'You feel the scale of the {n} from the first *morning*.',
    'We walked out towards the {n} straight from the door, no car *needed*.',
  ],
  sky: [
    'We went out late twice, and the {n} did not *disappoint*.',
    'Lying in bed under the {n} is the reason to *book*.',
    'Set an alarm: our best view of the {n} came after *midnight*.',
  ],
  snow: [
    'Fresh {n} every morning, and the path to the door was always *cleared*.',
    'We came for the {n} and got plenty of *it*.',
    'Coming in from the {n} to a warm house is the whole *point*.',
  ],
  mist: [
    'Some mornings the {n} hid everything, then lifted by *ten*.',
    'The {n} came in at dusk and turned the windows *white*.',
    'We had two days of {n}, and the house was even better for *it*.',
  ],
  desert: [
    'By day the {n} glows, by night it goes completely *dark*.',
    'The {n} changes colour every hour; we stopped checking our *phones*.',
    'Nothing but {n} and sky in every direction, as *promised*.',
  ],
  city: [
    'Minutes from everything, yet inside you forget the *{n}*.',
    'A calm base for a week of walking the {n}, and the bed was *excellent*.',
    'We came for the architecture and stayed in more than we *planned*.',
  ],
  fields: [
    'Breakfast outside over the {n} became the best part of the *day*.',
    'The {n} start at the door, and we walked them every *evening*.',
    'You look over the {n} from every room; it never got *old*.',
  ],
}

/** For any stay, whatever its landscape. `{t}` is the type, `{a}` the architect, `{l}` the location. */
const HOUSE_OPENERS = [
  'The {t} is smaller than it looks in the photos, and *better* for it.',
  'You can tell {a} thought about every *joint* and window.',
  'Our second time at the {t}, and it was as good as the *first*.',
  'We booked two nights in {l} and wished we had booked *four*.',
  'The best-made {t} we have stayed in, down to the door *handles*.',
  'We arrived in the dark and only saw the {t} properly at *sunrise*.',
  'Every surface is real timber, stone or glass, and it *shows*.',
]

const AMENITY_FACTS: Record<Amenity, string[]> = {
  sauna: ['The sauna was hot within forty minutes of lighting it.', 'We used the sauna every evening and slept like stones.'],
  'hot-tub': ['We used the hot tub every night, even in the rain.', 'The hot tub was clean and ready when we arrived.'],
  fireplace: ['Dry wood was stacked by the fireplace when we arrived.', 'The fireplace heats the whole room within the hour.'],
  pool: ['The pool was warm enough by early afternoon.', 'We had the pool to ourselves every day.'],
  workspace: ['The desk worked well for two days of calls.', 'Good desk, good chair, fast enough connection for work.'],
  'ev-charger': ['Charging the car on site saved us a detour.', 'The EV charger worked first time and overnight.'],
}

const GENERAL_FACTS = [
  'Spotless on arrival, and the beds were made with good linen.',
  'The kitchen had everything we needed for simple dinners.',
  'The photos match what you get.',
  'The door code arrived two days before, as promised.',
  'Clear directions for the last stretch, which we needed.',
  'Good coffee kit and a well-stocked pantry for the first morning.',
]

function openersFor(stay: Stay) {
  const fill = (s: string, noun = '') =>
    s.replaceAll('{n}', noun).replaceAll('{t}', stay.type.toLowerCase()).replaceAll('{a}', stay.architect).replaceAll('{l}', stay.location)
  const fromScenes = stay.landscape.flatMap((keyword) => {
    const scene = SCENES[keyword]
    return scene ? SCENE_OPENERS[scene.scene].map((s) => fill(s, scene.noun)) : []
  })
  return [...new Set([...fromScenes, ...HOUSE_OPENERS.map((s) => fill(s))])]
}

function factsFor(stay: Stay, story: Story) {
  const host = story.host.name === 'Your host' ? 'The host' : story.host.name
  const rural = !stay.landscape.some((k) => SCENES[k]?.scene === 'city')
  return [
    ...stay.amenities.flatMap((a) => AMENITY_FACTS[a]),
    ...GENERAL_FACTS,
    `${host} answered every message within the hour.`,
    `${host} left a hand-drawn map of the walks nearby.`,
    stay.instantBook ? 'Booking was confirmed straight away.' : `${host} accepted our request within a few hours.`,
    ...(stay.offGrid
      ? ['Power and water are the house’s own; the notes explain both on the first day.', 'It runs on solar, so we watched the battery gauge on grey days. Never ran out.']
      : []),
    ...(stay.petFriendly ? ['Our dog was welcome and had a bowl waiting.', 'Dog-friendly in practice, not just on paper.'] : []),
    ...(rural ? ['Bring groceries: the nearest shop is a drive away.', 'Signal is patchy, which we came to like.'] : []),
  ]
}

/* ─── People and dates ──────────────────────────────────────────────────── */

const FIRST_NAMES = [
  'Anna', 'Ben', 'Clara', 'David', 'Elin', 'Felix', 'Greta', 'Hugo', 'Ida', 'Jonas', 'Karin', 'Leo',
  'Maja', 'Nils', 'Olga', 'Pablo', 'Rosa', 'Simon', 'Tove', 'Ulrich', 'Vera', 'Wim', 'Yara', 'Zoe',
  'Agnes', 'Bruno', 'Chiara', 'Daan', 'Emil', 'Freya', 'Gustav', 'Helena', 'Isak', 'Julia', 'Kai',
  'Lotte', 'Marco', 'Nora', 'Oskar', 'Paula', 'Rafael', 'Sara', 'Theo', 'Ulla', 'Viktor', 'Wanda',
]
const INITIALS = 'ABCDEFGHJKLMNOPRSTVW'.split('')
const CITIES = [
  'Oslo', 'Stockholm', 'Copenhagen', 'Helsinki', 'Berlin', 'Hamburg', 'Munich', 'Vienna', 'Zurich',
  'Geneva', 'Milan', 'Turin', 'Rome', 'Lyon', 'Paris', 'Brussels', 'Amsterdam', 'Rotterdam', 'London',
  'Edinburgh', 'Dublin', 'Lisbon', 'Porto', 'Madrid', 'Barcelona', 'Prague', 'Warsaw', 'Kraków',
  'Budapest', 'Ljubljana', 'Bergen', 'Gothenburg', 'Aarhus', 'Basel', 'Ghent', 'Utrecht', 'New York', 'Toronto',
]
const RATING_DRIFT = [-0.3, -0.2, -0.1, -0.1, 0, 0, 0, 0, 0.1, 0.1, 0.2]

/** ISO months ("2026-03") from the month after `from` to the month of `to`. */
function monthsBetween(from: string, to: string) {
  const months: string[] = []
  let y = Number(from.slice(0, 4))
  let m = Number(from.slice(5, 7)) + 1
  const end = to.slice(0, 7)
  for (;;) {
    if (m > 12) {
      y++
      m = 1
    }
    const iso = `${y}-${String(m).padStart(2, '0')}`
    if (iso > end) break
    months.push(iso)
    m++
  }
  return months.length ? months : [end]
}

/** Small deterministic PRNG (mulberry32), seeded from a string. */
function seeded(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
