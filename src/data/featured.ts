import { stays, type Stay } from './stays'

/** Editorial layer for (02) Featured stays: which stays, and in what order. */

const featuredIds = ['speglhus', 'ala-capsule', 'taiga-domes', 'rimal-dome', 'kiefer-haus', 'casa-socalco']

export const featuredStays: Stay[] = featuredIds.flatMap((id) => stays.filter((s) => s.id === id))
