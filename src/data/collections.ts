export type CollectionId = 'cliff' | 'forest' | 'brutalist' | 'desert' | 'waterfront'

export interface Collection {
  id: CollectionId
  title: string
  description: string
}

/** Landscape collections, in switcher order. Stays opt in via `Stay.collections`. */
export const collections: Collection[] = [
  {
    id: 'cliff',
    title: 'Cliff & Monoliths',
    description: 'Concrete homes built on rock: a Madeira hillside and Sardinian granite.',
  },
  {
    id: 'forest',
    title: 'Forest Homes',
    description: 'Mirror, timber and glass houses among pine and birch in Norway, Sweden, Finland, Germany and Portugal.',
  },
  {
    id: 'brutalist',
    title: 'Brutalist Homes',
    description: 'Cast and board-marked concrete: a loft in a former Berlin print hall and two villas on the coast.',
  },
  {
    id: 'desert',
    title: 'Desert Minimal',
    description: 'A glass dome in Wadi Rum and rammed-earth courtyards near Marrakech. Hot days, cold nights.',
  },
  {
    id: 'waterfront',
    title: 'Waterfront Escapes',
    description: 'A cabin moored in a Norwegian fjord and a fisherman’s hut on stilts over a Portuguese lagoon.',
  },
]

export const collectionById = (id: string) => collections.find((c) => c.id === id)
