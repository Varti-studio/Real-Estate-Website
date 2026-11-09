/** A guest's account of a stay, shown in (06) Reflections. */
export interface Reflection {
  id: string
  /** The stay it describes (`Stay.id`). */
  stayId: string
  guest: string
  city: string
  /** ISO month of the stay, e.g. "2026-09". */
  stayed: string
  /** Out of 10. */
  rating: number
  /** `*word*` marks the one serif-italic accent. */
  quote: string
}

/** Reviews in card order. */
export const reflections: Reflection[] = [
  {
    id: 'dimstuga-sophia',
    stayId: 'dimstuga',
    guest: 'Sophia M.',
    city: 'Milan',
    stayed: '2026-09',
    rating: 9.4,
    quote:
      'It really is one room: a bed, a stove, a small sauna and a shower. The stove heats it in ten minutes, but the floor is *cold* first thing, so bring slippers.',
  },
  {
    id: 'casa-monolite-jonas',
    stayId: 'casa-monolite',
    guest: 'Jonas K.',
    city: 'Hamburg',
    stayed: '2026-06',
    rating: 9.0,
    quote:
      'The drive from Olbia ends on a gravel track, so go slowly. We cooked most nights and swam before *breakfast*. The desk is a real desk, which I needed.',
  },
  {
    id: 'nordlys-dome-amelie',
    stayId: 'nordlys-dome',
    guest: 'Amélie R.',
    city: 'Lyon',
    stayed: '2026-02',
    rating: 9.9,
    quote: 'Two cloudy nights, then the aurora at 1 a.m. on the third. We watched it from the hot *tub*.',
  },
  {
    id: 'rimal-dome-hannah',
    stayId: 'rimal-dome',
    guest: 'Hannah L.',
    city: 'Zurich',
    stayed: '2026-04',
    rating: 8.6,
    quote:
      'The glass heats up fast after lunch, so we spent the afternoons in the shade of the cliff. Nights were cold and full of *stars*. The jeep ride in is bumpy: hold on to your coffee.',
  },
  {
    id: 'flyt-cabin-marcus',
    stayId: 'flyt-cabin',
    guest: 'Marcus O.',
    city: 'Edinburgh',
    stayed: '2026-07',
    rating: 9.2,
    quote:
      'Pack a soft bag, because you row it across yourself. The cabin rocks a little when the wind gets up, which kept me awake the first night. By the third I slept like a *log*.',
  },
  {
    id: 'casa-palafita-ines',
    stayId: 'casa-palafita',
    guest: 'Inès D.',
    city: 'Paris',
    stayed: '2026-08',
    rating: 9.7,
    quote: 'One room, a deck and the tide coming in under the floor. Herons every *morning*. It suits two people who like each other.',
  },
]
