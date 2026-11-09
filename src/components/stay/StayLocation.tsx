import { lazy, Suspense, useMemo, useRef } from 'react'
import { useInView } from 'framer-motion'
import type { Stay } from '../../data/stays'
import { parseCoordinates } from '../../lib/catalog'
import { roughCoordinates } from '../../lib/format'
import { typeset } from '../../lib/typography'
import type { Story } from '../../lib/stay'
import { MonoLabel } from '../ui/MonoLabel'
import { StaySection } from './StaySection'
import { accent } from './text'

const LocationMap = lazy(() => import('./LocationMap'))

const FRAME = 'aspect-[4/5] w-full sm:aspect-[16/9]'

/** The map with the house and its buffer zone, how to get there, and what's near. */
export function StayLocation({ stay, story }: { stay: Stay; story: Story }) {
  const center = useMemo(() => parseCoordinates(stay.coordinates), [stay.coordinates])
  // maplibre only downloads once the section is close
  const slot = useRef<HTMLDivElement>(null)
  const near = useInView(slot, { once: true, margin: '600px 0px' })

  return (
    <StaySection
      id="location"
      index="(06)"
      title={<>Where you will {accent('be')}</>}
      meta={
        <>
          {story.region}, {stay.country} · {roughCoordinates(stay.coordinates)}
        </>
      }
    >
      <div ref={slot}>
        {near ? (
          <Suspense fallback={<Placeholder />}>
            <LocationMap center={center} bufferMetres={story.bufferMetres} label={`Map of the area around ${stay.name}`} className={FRAME} />
          </Suspense>
        ) : (
          <Placeholder />
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-baseline lg:gap-10">
        <p className="max-w-[60ch] text-body leading-[1.55] text-graphite-600 lg:col-span-7">{typeset(story.locationNote)}</p>
        <div className="lg:col-span-5">
          {/* Flush with the map's right edge from lg, like the distances below it */}
          <MonoLabel className="block text-ink lg:text-right">{typeset(`Private land · ${story.bufferMetres} m in every direction`)}</MonoLabel>
          {story.nearby.length > 0 && (
            <dl className="mt-4 border-t border-line">
              {story.nearby.map(({ place, distance }) => (
                <div key={place} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <dt className="text-body text-graphite-600">{place}</dt>
                  <dd className="font-mono text-label whitespace-nowrap tabular-nums">{typeset(distance)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </StaySection>
  )
}

function Placeholder() {
  return (
    <div className={`relative overflow-hidden rounded-frame border border-line bg-sand ${FRAME}`}>
      <div aria-hidden className="grain absolute inset-0 opacity-60" />
    </div>
  )
}
