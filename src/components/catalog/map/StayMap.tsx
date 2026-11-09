import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cubicBezier, motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { LngLatBounds, Map as MapLibre, Marker } from './maplibre'
import type { Stay } from '../../../data/stays'
import { parseCoordinates, type Bounds } from '../../../lib/catalog'
import { DURATION, EASE, transition } from '../../../lib/motion'
import { restyle, STYLE_URL } from './mapStyle'
import { PricePin, type PreviewPlacement } from './PricePin'
import { ZoomControls } from './ZoomControls'

export type StayMapProps = {
  /** Every stay that can appear; each gets a marker once. */
  stays: Stay[]
  /** Stays shown as pins right now; the rest shrink away. */
  results: Stay[]
  /** Stays to frame when the results change (ignored while searching as the map moves). */
  fitTo: Stay[]
  /** Card hovered in the list. */
  highlightedId: string | null
  /** Pin hovered, focused or tapped: its preview is open. */
  activeId: string | null
  onActiveChange: (id: string | null) => void
  /** Link for a pin's preview card. */
  stayHref: (stay: Stay) => string
  searchAsMove: boolean
  onSearchAsMoveChange: (on: boolean) => void
  onBoundsChange: (bounds: Bounds) => void
  className?: string
  /** Extra overlay, e.g. the mobile "List" button. */
  children?: ReactNode
}

const ease = cubicBezier(...EASE)
/** Rough preview card size, to keep it inside the map. */
const PREVIEW = { height: 280, halfWidth: 136 }

/**
 * MapLibre map on a restyled OpenFreeMap basemap. Pins are MapLibre markers
 * whose elements are React portal targets, so Framer Motion animates them.
 * Lazy-loaded: maplibre-gl only ships with the map.
 */
export default function StayMap({
  stays,
  results,
  fitTo,
  highlightedId,
  activeId,
  onActiveChange,
  stayHref,
  searchAsMove,
  onSearchAsMoveChange,
  onBoundsChange,
  className = '',
  children,
}: StayMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibre | null>(null)
  const markers = useRef<Record<string, Marker>>({})
  const firstFit = useRef(true)
  const [pins, setPins] = useState<Record<string, HTMLElement>>({})
  const [ready, setReady] = useState(false)
  const [placement, setPlacement] = useState<PreviewPlacement>({ vertical: 'above', align: 'center' })
  const reduced = useReducedMotion()

  // Latest callbacks for the map's own listeners
  const report = useRef(onBoundsChange)
  report.current = onBoundsChange
  const deactivate = useRef(() => onActiveChange(null))
  deactivate.current = () => onActiveChange(null)

  /* Map + markers, once: the catalogue is static, `results` only shows or hides pins */
  useEffect(() => {
    if (!container.current) return
    const map = new MapLibre({
      container: container.current,
      center: [12, 50],
      zoom: 3,
      minZoom: 1.5,
      maxZoom: 15,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      renderWorldCopies: false,
      attributionControl: { compact: true },
    })
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.setStyle(STYLE_URL, { transformStyle: (_previous, next) => restyle(next) })
    map.once('load', () => {
      setReady(true)
      // Compact attribution starts expanded; fold it to its ⓘ so it clears the overlay pills
      const attribution = map.getContainer().querySelector('.maplibregl-ctrl-attrib.maplibregl-compact')
      attribution?.classList.remove('maplibregl-compact-show')
      attribution?.removeAttribute('open')
    })

    map.on('moveend', () => {
      const b = map.getBounds()
      report.current({ west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() })
    })
    // A tap on the map itself (not a pin) closes the preview
    map.on('click', (e) => {
      if (!(e.originalEvent.target as HTMLElement).closest('.maplibregl-marker')) deactivate.current()
    })

    const elements: Record<string, HTMLElement> = {}
    for (const stay of stays) {
      const element = document.createElement('div')
      markers.current[stay.id] = new Marker({ element }).setLngLat(parseCoordinates(stay.coordinates)).addTo(map)
      elements[stay.id] = element
    }
    mapRef.current = map
    setPins(elements)

    return () => {
      map.remove()
      mapRef.current = null
      markers.current = {}
      firstFit.current = true
    }
  }, [])

  /* Frame the results when they change */
  const fitKey = fitTo.map((s) => s.id).join()
  useEffect(() => {
    const map = mapRef.current
    if (!map || !container.current || searchAsMove || !fitTo.length) return
    const bounds = new LngLatBounds()
    for (const stay of fitTo) bounds.extend(parseCoordinates(stay.coordinates))
    const pad = Math.min(80, container.current.clientWidth * 0.12)
    map.fitBounds(bounds, {
      // Room for the floating controls at the top
      padding: { top: pad + 56, bottom: pad, left: pad, right: pad },
      maxZoom: 7,
      duration: firstFit.current || reduced ? 0 : DURATION.image * 1000,
      easing: ease,
    })
    firstFit.current = false
  }, [fitKey, searchAsMove, pins])

  /* Lift the active and highlighted pins above their neighbours */
  useEffect(() => {
    for (const [id, marker] of Object.entries(markers.current)) {
      marker.getElement().style.zIndex = id === activeId ? '3' : id === highlightedId ? '2' : '1'
    }
  }, [activeId, highlightedId, pins])

  /** Opens a pin's preview on the side with room for it. */
  const activate = (stay: Stay) => {
    const map = mapRef.current
    const box = container.current
    if (map && box) {
      const { x, y } = map.project(parseCoordinates(stay.coordinates))
      setPlacement({
        vertical: y < PREVIEW.height ? 'below' : 'above',
        align: x < PREVIEW.halfWidth ? 'start' : x > box.clientWidth - PREVIEW.halfWidth ? 'end' : 'center',
      })
    }
    onActiveChange(stay.id)
  }

  const zoom = (by: 1 | -1) => {
    const map = mapRef.current
    if (!map) return
    const options = { duration: reduced ? 0 : DURATION.ui * 1000, easing: ease }
    if (by > 0) map.zoomIn(options)
    else map.zoomOut(options)
  }

  const shown = new Set(results.map((s) => s.id))
  const byId = new Map(stays.map((s) => [s.id, s]))

  return (
    // clip-path, not just overflow + radius: the WebGL canvas is composited and escapes a rounded overflow clip
    <div
      role="region"
      aria-label="Map of stays"
      className={`relative isolate overflow-hidden rounded-frame bg-paper font-sans [clip-path:inset(0_round_var(--radius-frame))] ${className}`}
    >
      {/* Sized, not inset: maplibre's CSS makes the container `position: relative` */}
      <div ref={container} className="h-full w-full" />

      {/* Tone-on-tone veil until the basemap has painted */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={transition(DURATION.ui)}
        className="pointer-events-none absolute inset-0 bg-sand"
      >
        <div className="grain absolute inset-0 opacity-60" />
      </motion.div>

      {/* Search as I move the map */}
      <label className="absolute top-4 left-1/2 z-10 inline-flex h-10 -translate-x-1/2 cursor-pointer items-center gap-3 rounded-full border border-line bg-milk pr-4 pl-2 text-body tracking-[-0.01em] whitespace-nowrap shadow-soft">
        <input
          type="checkbox"
          checked={searchAsMove}
          onChange={(e) => onSearchAsMoveChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`grid size-6 place-items-center rounded-full border transition-colors duration-500 ease-cinematic peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent ${
            searchAsMove ? 'border-ink bg-ink text-milk' : 'border-stone-300'
          }`}
        >
          {searchAsMove && <Check size={12} strokeWidth={1.5} />}
        </span>
        Search as I move the map
      </label>

      <ZoomControls onZoom={zoom} />

      {children}

      {Object.entries(pins).map(([id, element]) => {
        const stay = byId.get(id)
        if (!stay) return null
        return createPortal(
          <PricePin
            stay={stay}
            href={stayHref(stay)}
            visible={shown.has(id)}
            highlighted={id === highlightedId || id === activeId}
            open={id === activeId}
            placement={placement}
            onActivate={() => activate(stay)}
            onDeactivate={() => {
              if (activeId === id) onActiveChange(null)
            }}
          />,
          element,
          id,
        )
      })}
    </div>
  )
}
