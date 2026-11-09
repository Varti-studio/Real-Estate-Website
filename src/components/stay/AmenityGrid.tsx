import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AirVent,
  AlarmSmoke,
  AppWindow,
  Bath,
  BatteryCharging,
  Bike,
  Binoculars,
  BookOpen,
  Car,
  Coffee,
  CookingPot,
  Cross,
  Droplets,
  Fence,
  FireExtinguisher,
  Flame,
  Heater,
  Lamp,
  Laptop,
  PlugZap,
  Refrigerator,
  ShowerHead,
  Speaker,
  Telescope,
  Thermometer,
  Trees,
  Tv,
  WashingMachine,
  WavesLadder,
  Wifi,
  Shirt,
  type LucideIcon,
} from 'lucide-react'
import type { AmenityGroup, AmenityIcon, StayAmenity } from '../../data/stayStories'
import { fadeUp } from '../../lib/motion'
import type { Story } from '../../lib/stay'
import { MonoLabel } from '../ui/MonoLabel'
import { Sheet } from '../ui/Sheet'
import { MoreButton, StaySection } from './StaySection'
import { accent } from './text'

/** Every `AmenityIcon` needs a glyph, so a new one without an icon is a type error. */
const ICONS: Record<AmenityIcon, LucideIcon> = {
  sauna: Heater,
  glass: AppWindow,
  fireplace: Flame,
  wifi: Wifi,
  workspace: Laptop,
  linen: Shirt,
  ev: PlugZap,
  kitchen: CookingPot,
  coffee: Coffee,
  fridge: Refrigerator,
  bath: Bath,
  shower: ShowerHead,
  deck: Fence,
  forest: Trees,
  solar: BatteryCharging,
  water: Droplets,
  parking: Car,
  speaker: Speaker,
  books: BookOpen,
  heating: Thermometer,
  telescope: Telescope,
  bike: Bike,
  smoke: AlarmSmoke,
  firstaid: Cross,
  extinguisher: FireExtinguisher,
  tv: Tv,
  washer: WashingMachine,
  ac: AirVent,
  pool: WavesLadder,
  hottub: Bath,
  lamp: Lamp,
  binoculars: Binoculars,
}

const GROUPS: AmenityGroup[] = ['Wellness', 'Living', 'Kitchen', 'Work', 'Outdoors', 'Safety']

/** How many show before "Show all". */
const PREVIEW = 8

/** A two-column list of what the house offers; the full list opens in a sheet, by group. */
export function AmenityGrid({ story }: { story: Story }) {
  const [open, setOpen] = useState(false)
  const { amenities } = story

  return (
    <StaySection id="amenities" index="(02)" title={<>What this place {accent('offers')}</>}>
      <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
        {amenities.slice(0, PREVIEW).map((a) => (
          <Row key={a.label} amenity={a} />
        ))}
      </ul>

      {amenities.length > PREVIEW && (
        <MoreButton onClick={() => setOpen(true)}>Show all {amenities.length} amenities</MoreButton>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Amenities" count={amenities.length}>
        {GROUPS.map((group) => {
          const items = amenities.filter((a) => a.group === group)
          if (!items.length) return null
          return (
            <motion.section key={group} variants={fadeUp} aria-label={group} className="pt-8 last:pb-8">
              <MonoLabel className="text-ink">{group}</MonoLabel>
              {/* Each row closes with its own hairline; the groups add none */}
              <ul className="mt-3">
                {items.map((a) => (
                  <Row key={a.label} amenity={a} />
                ))}
              </ul>
            </motion.section>
          )
        })}
      </Sheet>
    </StaySection>
  )
}

function Row({ amenity: { icon, label } }: { amenity: StayAmenity }) {
  const Icon = ICONS[icon]
  return (
    <li className="flex items-center gap-4 border-b border-line py-4">
      <Icon size={20} strokeWidth={1.5} aria-hidden className="text-ink" />
      <span className="text-body tracking-[-0.01em]">{label}</span>
    </li>
  )
}
