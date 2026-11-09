import { ADDRESS_NOTE, CANCELLATION, HOUSE_TIMES, PETS } from './copy'
import { unsplash, portrait } from './stays'

/** Icons for the amenity list (Lucide glyphs mapped in `stay/AmenityGrid`). */
export type AmenityIcon =
  | 'sauna'
  | 'glass'
  | 'fireplace'
  | 'wifi'
  | 'workspace'
  | 'linen'
  | 'ev'
  | 'kitchen'
  | 'coffee'
  | 'fridge'
  | 'bath'
  | 'shower'
  | 'deck'
  | 'forest'
  | 'solar'
  | 'water'
  | 'parking'
  | 'speaker'
  | 'books'
  | 'heating'
  | 'telescope'
  | 'bike'
  | 'smoke'
  | 'firstaid'
  | 'extinguisher'
  | 'tv'
  | 'washer'
  | 'ac'
  | 'pool'
  | 'hottub'
  | 'lamp'
  | 'binoculars'

export type AmenityGroup = 'Wellness' | 'Living' | 'Kitchen' | 'Work' | 'Outdoors' | 'Safety'

export interface StayAmenity {
  icon: AmenityIcon
  label: string
  group: AmenityGroup
}

export type StandardIcon = 'key' | 'sun' | 'compass' | 'leaf' | 'shield' | 'zap' | 'paw'

export interface StayPhoto {
  image: string
  alt: string
  caption: string
}

export interface StayReview {
  guest: string
  city: string
  /** ISO month of the stay, e.g. "2026-09". */
  stayed: string
  /** Out of 10. */
  rating: number
  /** `*word*` marks the one serif-italic accent. */
  quote: string
}

/** Sub-scores out of 10, shown as the four metric bars. */
export interface StayScores {
  silence: number
  design: number
  cleanliness: number
  location: number
}

/**
 * Everything on a stay's page beyond the catalogue fields. Every field is
 * optional: `storyFor()` (lib/stay.ts) fills the gaps from the `Stay` itself.
 */
export interface StayStory {
  /** `*word*` marks the one serif-italic accent. */
  headline?: string
  /** Region shown before the country, e.g. "Aurland, Vestland". */
  region?: string
  /** The owner. `since` defaults to the year the stay was listed, `responds` to "Replies within a day". `phone` is shown masked once booked, e.g. "+47 ••• •• 412". */
  host?: { name: string; since?: number; responds?: string; phone?: string; /** Square portrait URL (`portrait()`). */ photo?: string }
  /** How a booked guest gets in: where to head for (`point`, the directions tile) and the last stretch (`steps`, one or two sentences). */
  arrival?: { point: string; steps: string }
  rooms?: { bedrooms: number; beds: string; baths: string }
  standards?: { icon: StandardIcon; title: string; body: string }[]
  /** 2–4 sentences on this house: what it is, materials, view, access, one distinctive thing. The first paragraph is the lede; a third opens with "Read more". */
  about?: string[]
  /** Standard amenities this house lacks; they are left out of its list. */
  unavailable?: AmenityIcon[]
  /** In gallery order: the first is the hero, the next two stack beside it. */
  photos?: StayPhoto[]
  amenities?: StayAmenity[]
  sleep?: { title: string; detail: string; image: string; alt: string }[]
  scores?: StayScores
  reviews?: StayReview[]
  locationNote?: string
  /** Radius of the private land around the house, drawn on the map. */
  bufferMetres?: number
  nearby?: { place: string; distance: string }[]
  rules?: { house: string[]; safety: string[]; cancellation: string[] }
  /** One-off fee per stay, in EUR. */
  cleaningFee?: number
  /** Local taxes as a share of the stay + cleaning (0.12 = 12%), added at checkout. Defaults to 0. */
  taxRate?: number
  minNights?: number
}

const TREEHOUSE_PHOTOS: StayPhoto[] = [
  {
    image: unsplash('1693678028299-4e2fda2dc990', 2000),
    alt: 'A timber treehouse standing on posts in a bright green forest',
    caption: 'The house on its posts, early summer',
  },
  {
    image: unsplash('1728649072511-bd946044a63b'),
    alt: 'A corner of floor-to-ceiling glass with a cast-iron stove and a view into the trees',
    caption: 'Glass corner, cast-iron stove',
  },
  {
    image: unsplash('1597113366853-fea190b6cd82'),
    alt: 'Weathered pine boards with deep grain and dark knots',
    caption: 'Pine milled on the property',
  },
  {
    image: unsplash('1648326342761-8a9abfb7a2c0'),
    alt: 'A bed in a timber room facing a large window onto tall pines',
    caption: 'Bedroom, window to the canopy',
  },
  {
    image: unsplash('1761897190222-d222d88851c9'),
    alt: 'A cabin interior with tall windows overlooking an autumn forest and a lake',
    caption: 'Lounge, valley light',
  },
  {
    image: unsplash('1716908520076-4acd8a09f537'),
    alt: 'A wood-burning stove in a pale timber room with glass doors',
    caption: 'Wood stove, oiled pine walls',
  },
  {
    image: unsplash('1786799901347-e45b3e2d64ea'),
    alt: 'A cedar sauna with tiered benches and a window onto the forest',
    caption: 'Cedar sauna, forest window',
  },
  {
    image: unsplash('1726966305376-21ed47eb6870'),
    alt: 'A tall dark-framed window looking into a stand of pines',
    caption: 'Hall window, north light',
  },
  {
    image: unsplash('1789125081574-ce6cf938d815'),
    alt: 'A timber deck with a glass roof raised among tall evergreen trees',
    caption: 'Glass-roofed deck',
  },
  {
    image: unsplash('1781871226730-0a856186a513'),
    alt: 'A single chair on a wooden deck surrounded by green forest',
    caption: 'Reading chair on the deck',
  },
  {
    image: unsplash('1644008114609-2c8a09b26841'),
    alt: 'A gabled window framing pine trees from a dark timber room',
    caption: 'Gable window',
  },
  {
    image: unsplash('1734454736775-ca983e015297', 2000),
    alt: 'A wide valley floor between steep mountains under low grey cloud',
    caption: 'The valley, a ten-minute walk down',
  },
]

/** Ljós Dome: the dome and the land around it. The first and the last three come from one shoot (Robert Arnar, Iceland). */
const LJOS_PHOTOS: StayPhoto[] = [
  {
    image: unsplash('1703027816278-2573b76e62f9', 2000),
    alt: 'A pale canvas geodesic dome on a snowfield, framed by dark lava rock',
    caption: 'The dome on the lava field',
  },
  {
    image: unsplash('1641375712569-055e70fa571d'),
    alt: 'A rumpled bed under a geodesic frame, with fog beyond the window panels',
    caption: 'Bed under the frame',
  },
  {
    image: unsplash('1736976881614-a2c03e2e2256'),
    alt: 'A round hot tub set into snowy ground behind dry grass',
    caption: 'Hot tub, steps from the door',
  },
  {
    image: unsplash('1730012066338-d544cf255500', 2000),
    alt: 'Thick green moss covering lava rocks',
    caption: 'Moss on the lava field',
  },
  {
    image: unsplash('1488415032361-b7e238421f1b'),
    alt: 'Green northern lights over snowy mountains, reflected in still water',
    caption: 'Aurora over the lake',
  },
  {
    image: unsplash('1703027816547-cd67646be8a6'),
    alt: 'Snow lying in patches across a dark lava slope',
    caption: 'Snow on the lava slopes',
  },
  {
    image: unsplash('1703027817396-2e4a8ca87fdd', 2000),
    alt: 'A snowy shoreline meeting dark open water, seen from above',
    caption: 'Lake shore in winter',
  },
  {
    image: unsplash('1703027783266-2304bfd74681'),
    alt: 'Low sun breaking through cloud over a flat moss plain',
    caption: 'Late sun over the moss',
  },
]

const amenity = (group: AmenityGroup, icon: AmenityIcon, label: string): StayAmenity => ({ icon, label, group })

/** Rich content by `Stay.id`. Stays without an entry get generated defaults. */
export const stayStories: Record<string, StayStory> = {
  'canopy-treehouse': {
    headline: 'Canopy Treehouse above the *Aurland* valley',
    region: 'Aurland, Vestland',
    host: { name: 'Ingrid', photo: portrait('1604072366595-e75dc92d6bdc'), since: 2019, responds: 'Replies within an hour', phone: '+47 ••• •• 412' },
    arrival: {
      point: 'Trailhead parking, Aurland',
      steps: 'Park at the trailhead, walk 10 minutes up the path and cross the rope bridge.',
    },
    rooms: { bedrooms: 1, beds: '1 king bed', baths: '1 bath' },
    about: [
      'A one-room treehouse of oiled pine and glass, nine metres up in old pines above the Aurland valley, built around three living trees.',
      'You cross a rope bridge to get in, so bring a small bag; parking is at the trailhead. Inside, the king bed and the bath sit under a glass roof, with a cast-iron stove and a cedar sauna, all on solar power and spring water.',
    ],
    photos: TREEHOUSE_PHOTOS,
    amenities: [
      amenity('Wellness', 'sauna', 'Panoramic cedar sauna'),
      amenity('Living', 'glass', 'Floor-to-ceiling glass'),
      amenity('Living', 'fireplace', 'Cast-iron fireplace'),
      amenity('Work', 'wifi', 'Starlink Wi-Fi'),
      amenity('Work', 'workspace', 'Dedicated workspace'),
      amenity('Living', 'linen', 'Organic linen bedding'),
      amenity('Outdoors', 'ev', 'EV charger at the trailhead'),
      amenity('Wellness', 'bath', 'Bath beneath a glass roof'),
      amenity('Wellness', 'shower', 'Rain shower'),
      amenity('Wellness', 'linen', 'Waffle robes and towels'),
      amenity('Living', 'heating', 'Underfloor heating'),
      amenity('Living', 'speaker', 'Record player and vinyl'),
      amenity('Living', 'books', 'Architecture library'),
      amenity('Living', 'lamp', 'Blackout linen blinds'),
      amenity('Kitchen', 'kitchen', 'Two-ring induction hob'),
      amenity('Kitchen', 'fridge', 'Compact fridge'),
      amenity('Kitchen', 'coffee', 'Pour-over coffee kit'),
      amenity('Kitchen', 'kitchen', 'Cast-iron cookware'),
      amenity('Kitchen', 'water', 'Spring water on tap'),
      amenity('Work', 'workspace', 'Desk facing the canopy'),
      amenity('Work', 'solar', 'Battery bank for devices'),
      amenity('Outdoors', 'deck', 'Deck over the slope'),
      amenity('Outdoors', 'forest', 'Private forest trails'),
      amenity('Outdoors', 'telescope', 'Telescope for clear nights'),
      amenity('Outdoors', 'binoculars', 'Binoculars and bird guide'),
      amenity('Outdoors', 'bike', 'Two e-bikes'),
      amenity('Outdoors', 'parking', 'Free parking at the trailhead'),
      amenity('Safety', 'smoke', 'Smoke alarm'),
      amenity('Safety', 'firstaid', 'First aid kit'),
      amenity('Safety', 'extinguisher', 'Fire extinguisher'),
    ],
    sleep: [
      {
        title: 'Bedroom',
        detail: '1 king bed · glass roof above',
        image: unsplash('1648326342761-8a9abfb7a2c0', 800),
        alt: 'A bed in a timber room facing a large window onto tall pines',
      },
      {
        title: 'Living lounge',
        detail: 'Daybed for reading · valley view',
        image: unsplash('1761897190222-d222d88851c9', 800),
        alt: 'A cabin interior with tall windows overlooking an autumn forest and a lake',
      },
    ],
    scores: { silence: 10, design: 9.8, cleanliness: 10, location: 10 },
    reviews: [
      {
        guest: 'Marta S.',
        city: 'Copenhagen',
        stayed: '2026-09',
        rating: 10,
        quote: 'The rope bridge is the only way in, and it sets the tone for the whole stay. We read, we slept, we watched the *weather* cross the valley.',
      },
      {
        guest: 'Tomasz W.',
        city: 'Kraków',
        stayed: '2026-08',
        rating: 9.8,
        quote: 'Woke to rain on the glass above the bed. The stove kept the room warm all night, and the photos are *honest*: it is small, and perfect.',
      },
      {
        guest: 'Lena H.',
        city: 'Vienna',
        stayed: '2026-07',
        rating: 9.9,
        quote: 'Accurate down to the number of steps. Check-in instructions came two days early, with a hand-drawn map of the *ridge* path.',
      },
      {
        guest: 'Daniel R.',
        city: 'Rotterdam',
        stayed: '2026-06',
        rating: 9.8,
        quote: 'Bring groceries: the village is further than it looks. But the walk back up, at *dusk*, was the best part of every day.',
      },
    ],
    locationNote: `A ten-minute walk up from the valley floor, and 3 km along the ridge path to Aurland village (bakery, bus stop, small shop). Parking is at the trailhead, not at the house. ${ADDRESS_NOTE}`,
    bufferMetres: 400,
    nearby: [
      { place: 'Aurland village', distance: '3 km' },
      { place: 'Flåm station', distance: '9 km' },
      { place: 'Stegastein viewpoint', distance: '8 km' },
      { place: 'Bergen', distance: '2 h 40 by car' },
    ],
    rules: {
      house: [...HOUSE_TIMES, '2 guests maximum', PETS.rule(false), 'Quiet hours 22:00–08:00', 'No smoking anywhere on the land'],
      safety: ['Rope bridge with handrails', 'Steep stairs to the sleeping loft', 'Carbon monoxide alarm installed', 'No lifeguard at the river'],
      cancellation: CANCELLATION.rules,
    },
    cleaningFee: 85,
    minNights: 2,
  },

  /* ─── Host, description and reviews: the rest of these pages comes from storyFor()
     defaults. A stay's (06) Reflections quote is added first by storyFor(). ─── */

  'ljos-dome': {
    host: { name: 'Sigrún', photo: portrait('1524550158212-33f2ff985344') },
    about: [
      'A 38 m² geodesic dome of canvas on a timber frame, on the lava field above Lake Þingvallavatn.',
      'It runs on its own power and water. The hot tub is a few steps from the door along a rough path, so bring boots. In winter the aurora shows through the canvas, and in summer it hardly gets dark.',
    ],
    photos: LJOS_PHOTOS,
    sleep: [
      {
        title: 'Bedroom',
        detail: '1 double bed · under the dome',
        image: unsplash('1641375712569-055e70fa571d', 800),
        alt: 'A rumpled bed under a geodesic frame, with fog beyond the window panels',
      },
    ],
    reviews: [
      {
        guest: 'Freya J.',
        city: 'Oslo',
        stayed: '2026-02',
        rating: 9.8,
        quote: 'We kept the lights off all night. The aurora came twice, and the second time it turned the whole *dome* green, from the lava field to the lake.',
      },
      {
        guest: 'Luca B.',
        city: 'Turin',
        stayed: '2026-03',
        rating: 9.6,
        quote: 'The hot tub is a few steps from the door, so we went out at minus eight and stayed until the *steam* hid the stars. Bring proper boots for the path.',
      },
      {
        guest: 'Noor A.',
        city: 'Amsterdam',
        stayed: '2026-08',
        rating: 9.7,
        quote: 'In August it never really gets dark, and the timber frame glows gold through the canvas at midnight. A *strange*, gentle light to sleep under.',
      },
    ],
  },
  speglhus: {
    host: { name: 'Torbjørn', photo: portrait('1629649535931-67e5c48cc3ce') },
    about: [
      'A 64 m² house clad in mirror glass, in a birch grove above a lake in Telemark. From the path it reflects the trees so well that you see it late.',
      'Two bedrooms sleep four, with a desk by the window, a fireplace and a sauna facing the lake. Dogs are welcome.',
    ],
    reviews: [
      {
        guest: 'Kari N.',
        city: 'Bergen',
        stayed: '2026-05',
        rating: 9.7,
        quote: 'From the path you only see birches, then the birches move and you realise you are looking at the *house*. The sauna faces the lake.',
      },
      {
        guest: 'Ben T.',
        city: 'London',
        stayed: '2026-07',
        rating: 9.5,
        quote: 'A good desk, quiet mornings, and a fireplace for the cool evenings. Our dog spent the whole week watching her own *reflection*.',
      },
      {
        guest: 'Ines K.',
        city: 'Munich',
        stayed: '2026-09',
        rating: 9.6,
        quote: 'Birds do sometimes fly into the mirror, which the host warns you about. Otherwise it is the most *private* place we have stayed.',
      },
    ],
  },
  'ala-capsule': {
    host: { name: 'Inês', photo: portrait('1580489944761-15a19d654956') },
    about: [
      'A 48 m² A-frame of pine and corrugated steel, with a two-storey glass front facing the trees. It stands in a pine wood on the edge of Peneda-Gerês National Park, 20 minutes by car from Terras de Bouro.',
      'Linen curtains close the glass at night, and the bed is in a loft under the roof. Parking is beside the cabin.',
    ],
    reviews: [
      {
        guest: 'Rita M.',
        city: 'Lisbon',
        stayed: '2026-06',
        rating: 9.9,
        quote: 'Breakfast on the step with the curtains open and nothing but *pines* in front of us.',
      },
      {
        guest: 'Lukas H.',
        city: 'Hamburg',
        stayed: '2026-08',
        rating: 9.7,
        quote: 'A short drive to the waterfalls, then back to the stove. The loft ladder is steep, so pack *light*.',
      },
      {
        guest: 'Elodie P.',
        city: 'Lyon',
        stayed: '2026-09',
        rating: 9.8,
        quote: 'Rain on the steel roof all night, and the forest *steaming* in the morning.',
      },
    ],
  },
  'kiefer-haus': {
    host: { name: 'Katrin', photo: portrait('1612872513575-7e7666b96ff3') },
    about: [
      'A 184 m² villa of charred larch and faceted glass under a single old oak, about 90 minutes from Berlin.',
      'Three bedrooms sleep six. Outside are a pool, a sauna and a long table under the oak, and the lake is close enough to walk to. There is an EV charger, and dogs are welcome.',
    ],
    reviews: [
      {
        guest: 'Anna W.',
        city: 'Hamburg',
        stayed: '2026-05',
        rating: 9.6,
        quote: 'Two couples and two children for six days, and never once in each other’s way. The long table under the *oak* became the centre of everything.',
      },
      {
        guest: 'Ruth P.',
        city: 'Zurich',
        stayed: '2026-08',
        rating: 9.4,
        quote: 'The pool was cold until noon and perfect after. Charred larch smells of *smoke* when the sun hits it, which we came to love.',
      },
      {
        guest: 'Olivier M.',
        city: 'Brussels',
        stayed: '2026-09',
        rating: 9.5,
        quote: 'Ninety minutes from Berlin and it feels like another *decade*. Sauna, then the lake, then the fire. Repeat.',
      },
    ],
  },
  'taiga-domes': {
    host: { name: 'Aino', photo: portrait('1553514029-1318c9127859') },
    about: [
      'Two white geodesic domes among the pines of Finnish Lapland, 42 m² together and a short walk apart through the snow.',
      'Each dome is a bedroom, one with a double bed and one with a single. There is a wood-fired sauna and a fireplace, the domes run on their own power, and pets are welcome.',
    ],
    reviews: [
      {
        guest: 'Emma R.',
        city: 'Stockholm',
        stayed: '2026-01',
        rating: 9.5,
        quote: 'Two shells among the pines, joined by a short walk through the *snow*. The children still talk about it.',
      },
      {
        guest: 'Jakob S.',
        city: 'Vienna',
        stayed: '2026-02',
        rating: 9.3,
        quote: 'Clouds for three nights, then the whole sky went *green*. The host texts you when the forecast turns, which helps.',
      },
      {
        guest: 'Hanna L.',
        city: 'Helsinki',
        stayed: '2026-03',
        rating: 9.4,
        quote: 'A wood-fired sauna, a roll in the snow, and back into a warm dome by the fire. Simple, and exactly *right*.',
      },
    ],
  },
  'casa-socalco': {
    host: { name: 'Rui', photo: portrait('1615851943632-ffb942c2fceb') },
    about: [
      'Board-marked concrete terraces stepped into a steep hillside above the Atlantic on Madeira, 156 m² over several levels.',
      'Three bedrooms sleep five. The pool is on the lowest terrace, over the valley. The road up is steep and narrow, so rent a small car.',
    ],
    reviews: [
      {
        guest: 'Sofia G.',
        city: 'Lisbon',
        stayed: '2026-04',
        rating: 9.7,
        quote: 'Every terrace is a different room open to the Atlantic. We moved with the *shade* all day and never went inside before dark.',
      },
      {
        guest: 'Daniel C.',
        city: 'Madrid',
        stayed: '2026-06',
        rating: 9.5,
        quote: 'The road up is steep and narrow, so rent a small car. The pool hangs over the valley and is worth every *hairpin*.',
      },
      {
        guest: 'Lea H.',
        city: 'Basel',
        stayed: '2026-09',
        rating: 9.6,
        quote: 'Board-marked concrete, warm by evening, and wildflowers growing out of the walls. Brutal on paper, *tender* in person.',
      },
    ],
  },
  'rimal-dome': {
    host: { name: 'Salem', photo: portrait('1762066436595-67edb4610539') },
    about: [
      'A 34 m² glass geodesic dome at the end of a timber boardwalk, under the sandstone cliffs of Wadi Rum.',
      'A jeep brings you the last stretch across the sand. The dome runs on its own power and has a private hot tub; days are hot and nights cold, so pack layers.',
    ],
    reviews: [
      {
        guest: 'Yusuf H.',
        city: 'Istanbul',
        stayed: '2026-03',
        rating: 9.6,
        quote: 'The jeep drops you at dusk and drives off, and after that you hear nothing but the wind. The hot tub is the best seat in the *desert*.',
      },
      {
        guest: 'Marie D.',
        city: 'Geneva',
        stayed: '2026-05',
        rating: 9.7,
        quote: 'Hot by day, cold by night, and the dome handles both. Breakfast arrives on a tray while the cliffs turn *copper*.',
      },
    ],
  },
  betonloft: {
    host: { name: 'Felix', photo: portrait('1600603406200-5b2a104684ac') },
    about: [
      'A 142 m² loft in a former print hall in Berlin, with board-marked concrete walls, steel-framed windows and a skylight.',
      'Two bedrooms sleep four, and the long table works as a desk. The canal is nearby and dogs are welcome. It is a city loft, so expect street noise.',
    ],
    reviews: [
      {
        guest: 'Paul O.',
        city: 'Copenhagen',
        stayed: '2026-03',
        rating: 9.3,
        quote: 'Four days of work at the long table, evenings walking the canal. The ceiling is so high the city feels *far* away.',
      },
      {
        guest: 'Mira Z.',
        city: 'Warsaw',
        stayed: '2026-06',
        rating: 9.2,
        quote: 'Concrete stays cool in a Berlin heatwave, which we did not expect. The skylight turns the whole room into a *sundial*.',
      },
      {
        guest: 'Iris V.',
        city: 'Utrecht',
        stayed: '2026-09',
        rating: 9.4,
        quote: 'Our dog was welcomed with a bowl and a map of the parks. The loft is bare in the best way: nothing to look at but the *light*.',
      },
    ],
  },
  'dar-ocre': {
    host: { name: 'Yasmina', photo: portrait('1614312185032-a96342b80e3d') },
    about: [
      'Three rammed-earth courtyards in the Agafay desert, about 40 minutes from Marrakech, facing the Atlas mountains.',
      'The 210 m² villa has three bedrooms for six guests, a pool, a hot tub and a fireplace for cold evenings. The bathrooms are lined in honed travertine.',
    ],
    reviews: [
      {
        guest: 'Camille R.',
        city: 'Lyon',
        stayed: '2026-03',
        rating: 9.7,
        quote: 'The courtyard walls hold the day’s heat long after sunset. We ate by the fire and watched the Atlas go *pink*.',
      },
      {
        guest: 'Omar B.',
        city: 'Casablanca',
        stayed: '2026-04',
        rating: 9.5,
        quote: 'Forty minutes from Marrakech and nothing but stone and sky. The travertine bathroom alone is worth the *drive*.',
      },
      {
        guest: 'Sarah K.',
        city: 'New York',
        stayed: '2026-05',
        rating: 9.6,
        quote: 'Six of us, three courtyards, and somehow always a quiet corner. The pool at first light was *glass*.',
      },
    ],
  },
  'flyt-cabin': {
    host: { name: 'Eirik', photo: portrait('1701503098048-671c0a40d458') },
    about: [
      'A 36 m² timber cabin on a raft, moored in a fjord in Hardanger.',
      'You row the last hundred metres from the shore. The cabin runs on its own power and water, and the sauna is on the raft, so the fjord is the cold plunge. It rocks a little in the wind.',
    ],
    reviews: [
      {
        guest: 'Ingrid A.',
        city: 'Trondheim',
        stayed: '2026-08',
        rating: 9.9,
        quote: 'You row the last hundred metres yourself. After that the only sound is water knocking softly under the *floor*.',
      },
      {
        guest: 'Pierre L.',
        city: 'Bordeaux',
        stayed: '2026-09',
        rating: 9.7,
        quote: 'A sauna on a raft, then straight into the fjord. Cold enough to stop your *breath*, and we did it every morning.',
      },
    ],
  },
  'casa-palafita': {
    host: { name: 'Teresa', photo: portrait('1790574318882-572fa08ee6e6') },
    about: [
      'A fisherman’s hut on stilts above the Comporta lagoon, rebuilt in pine: one 48 m² room and a deck over the water.',
      'It runs on its own power and water. The beach is a bike ride through the rice fields, dogs are welcome, and you will want insect repellent at dusk.',
    ],
    reviews: [
      {
        guest: 'Rita S.',
        city: 'Porto',
        stayed: '2026-06',
        rating: 9.4,
        quote: 'We cycled through the rice fields to the beach and back at sunset. Bring repellent: the lagoon is *alive* at dusk.',
      },
      {
        guest: 'James W.',
        city: 'Dublin',
        stayed: '2026-09',
        rating: 9.6,
        quote: 'Small, simple and perfectly made. The deck runs straight out over the water, and our dog claimed the *end* of it.',
      },
    ],
  },
  dimstuga: {
    host: { name: 'Linnea', photo: portrait('1634149136549-47350a401065') },
    about: [
      'A 24 m² mirrored cube on stilts among the pines of Norrbotten, above a river.',
      'It is one room with a bed, a wood stove and a small sauna. The mirror walls reflect the trunks on every side, so the cube is hard to spot from the path.',
    ],
    reviews: [
      {
        guest: 'Erik L.',
        city: 'Gothenburg',
        stayed: '2026-09',
        rating: 9.9,
        quote: 'Twenty-four square metres and it never felt small. The pines are in every wall *twice*: once outside, once in the mirror.',
      },
      {
        guest: 'Aiko T.',
        city: 'Kyoto',
        stayed: '2026-09',
        rating: 9.8,
        quote: 'We lit the stove, the river ran somewhere below, and the mist came up through the trunks like *breath*.',
      },
    ],
  },
  'casa-monolite': {
    host: { name: 'Giovanna', photo: portrait('1752074211619-cc2c50a6b33f') },
    about: [
      'A 168 m² villa of cast concrete set into the granite of Gallura, in north-east Sardinia, with one long window onto the sea.',
      'Two bedrooms sleep four. The granite runs into the living room, the pool is cut into the rock outside, and there is a desk for work. The last stretch from Olbia is a gravel track.',
    ],
    reviews: [
      {
        guest: 'Elena P.',
        city: 'Rome',
        stayed: '2026-07',
        rating: 9.8,
        quote: 'The granite comes right inside, worn smooth, and the pool is cut into it. At night the whole *coast* goes dark.',
      },
      {
        guest: 'Henrik J.',
        city: 'Malmö',
        stayed: '2026-09',
        rating: 9.7,
        quote: 'A house that does almost nothing, on purpose. One long window, one long table, and the *sea* doing the rest.',
      },
    ],
  },
  'nordlys-dome': {
    host: { name: 'Håkon', photo: portrait('1586195408601-13cd270dd023') },
    about: [
      'A 32 m² insulated dome above the Lyngen fjord, with one large window.',
      'It runs on its own power. Outside are a hot tub and a sauna, and the snowline is a short walk uphill.',
    ],
    reviews: [
      {
        guest: 'Sigrid H.',
        city: 'Tromsø',
        stayed: '2026-09',
        rating: 9.9,
        quote: 'The first aurora of the autumn, seen from bed with the hot tub still warm outside. The fjord below was *ink*.',
      },
      {
        guest: 'Martin K.',
        city: 'Prague',
        stayed: '2026-09',
        rating: 9.8,
        quote: 'Sauna, then a walk to the snowline at sunrise. The mountains look close enough to *touch* from the deck.',
      },
    ],
  },
}
