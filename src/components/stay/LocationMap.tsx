import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cubicBezier, motion, useReducedMotion } from 'framer-motion'
import { House } from 'lucide-react'
import { DURATION, EASE, transition } from '../../lib/motion'
import { Map as MapLibre, Marker } from '../catalog/map/maplibre'
import { restyle, STYLE_URL, token } from '../catalog/map/mapStyle'
import { ZoomControls } from '../catalog/map/ZoomControls'

export type LocationMapProps = {
  /** `[lng, lat]`. */
  center: [number, number]
  /** Radius of the private land, drawn as a dashed circle. */
  bufferMetres: number
  /** Accessible name, e.g. "Map of Canopy Treehouse's surroundings". */
  label: string
  className?: string
}

const ease = cubicBezier(...EASE)
const METRES_PER_DEGREE = 111_320

/** A circle of `radius` metres as a GeoJSON ring (fine at this scale). */
function circle([lng, lat]: [number, number], radius: number, steps = 72) {
  const dLat = radius / METRES_PER_DEGREE
  const dLng = radius / (METRES_PER_DEGREE * Math.cos((lat * Math.PI) / 180))
  const ring = Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2
    return [lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]
  })
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  }
}

/**
 * One stay on the restyled basemap, with its buffer zone. Cooperative gestures
 * (Ctrl + scroll, two fingers on touch) so the page scroll is never captured.
 * Lazy-loaded, like the catalogue map.
 */
export default function LocationMap({ center, bufferMetres, label, className = '' }: LocationMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibre | null>(null)
  const [pin, setPin] = useState<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!container.current) return
    const map = new MapLibre({
      container: container.current,
      center,
      zoom: 13,
      minZoom: 6,
      maxZoom: 16,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      cooperativeGestures: true,
      attributionControl: { compact: true },
    })
    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.setStyle(STYLE_URL, { transformStyle: (_previous, next) => restyle(next) })
    map.once('load', () => {
      map.addSource('buffer', { type: 'geojson', data: circle(center, bufferMetres) })
      map.addLayer({
        id: 'buffer-fill',
        type: 'fill',
        source: 'buffer',
        paint: { 'fill-color': token('ink'), 'fill-opacity': 0.05 },
      })
      map.addLayer({
        id: 'buffer-line',
        type: 'line',
        source: 'buffer',
        paint: { 'line-color': token('graphite-600'), 'line-width': 1, 'line-dasharray': [3, 3] },
      })
      setReady(true)
      // Compact attribution starts expanded; fold it to its ⓘ
      const attribution = map.getContainer().querySelector('.maplibregl-ctrl-attrib.maplibregl-compact')
      attribution?.classList.remove('maplibregl-compact-show')
      attribution?.removeAttribute('open')
    })

    const element = document.createElement('div')
    new Marker({ element }).setLngLat(center).addTo(map)
    mapRef.current = map
    setPin(element)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [center[0], center[1], bufferMetres])

  const zoom = (by: 1 | -1) => {
    const map = mapRef.current
    if (!map) return
    const options = { duration: reduced ? 0 : DURATION.ui * 1000, easing: ease }
    if (by > 0) map.zoomIn(options)
    else map.zoomOut(options)
  }

  return (
    // clip-path, not just overflow + radius: the WebGL canvas is composited and escapes a rounded overflow clip
    <div
      role="region"
      aria-label={label}
      className={`relative isolate overflow-hidden rounded-frame border border-line bg-paper font-sans [clip-path:inset(0_round_var(--radius-frame))] ${className}`}
    >
      {/* Sized, not inset: maplibre's CSS makes the container `position: relative` */}
      <div ref={container} className="h-full w-full" />

      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={transition(DURATION.ui)}
        className="pointer-events-none absolute inset-0 bg-sand"
      >
        <div className="grain absolute inset-0 opacity-60" />
      </motion.div>

      <ZoomControls onZoom={zoom} />

      {pin &&
        createPortal(
          <span className="grid size-12 place-items-center rounded-full border-2 border-milk bg-ink text-milk shadow-lift">
            <House size={18} strokeWidth={1.5} aria-hidden />
          </span>,
          pin,
        )}
    </div>
  )
}
