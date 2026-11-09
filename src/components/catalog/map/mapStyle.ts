import type { LayerSpecification, StyleSpecification } from 'maplibre-gl'

/** OpenFreeMap's light basemap (no API key), restyled below. Attribution is required. */
export const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

/** Reads a palette token from the CSS custom properties, so no hex lives here. */
export const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()

/** Layer ids (or prefixes) with no place on an architectural basemap. */
const DROP = [/^aeroway/, /^railway/, /^road_(area_)?pier/, /shield/, /^airport$/, /^highway-name/, /^highway_path$/]

/**
 * Turns positron into a soft plan drawing: pale land, blue-grey water, green
 * parks, white roads on warm casings, hairline borders, graphite labels with
 * tracked capitals for countries. Colours are the `map-*` tokens in index.css.
 * Run as `transformStyle`, so the stock colours never paint.
 */
export function restyle(style: StyleSpecification): StyleSpecification {
  const c = {
    graphite: token('graphite-600'),
    stone: token('stone-500'),
    land: token('map-land'),
    water: token('map-water'),
    waterway: token('map-waterway'),
    park: token('map-park'),
    wood: token('map-wood'),
    residential: token('map-residential'),
    building: token('map-building'),
    ice: token('map-ice'),
    boundary: token('map-boundary'),
    boundaryMinor: token('map-boundary-minor'),
    waterLabel: token('map-water-label'),
    roadCasing: token('map-road-casing'),
    road: token('map-road'),
  }

  const fill = (layer: LayerSpecification, color: string, extra: Record<string, unknown> = {}) =>
    ({ ...layer, paint: { ...layer.paint, 'fill-color': color, 'fill-opacity': 1, ...extra } }) as LayerSpecification

  const layers = style.layers
    .filter((layer) => !DROP.some((re) => re.test(layer.id)))
    .map((layer): LayerSpecification => {
      const id = layer.id
      switch (layer.type) {
        case 'background':
          return { ...layer, paint: { 'background-color': c.land } }

        case 'fill': {
          if (id === 'water') return fill(layer, c.water, { 'fill-antialias': true })
          if (id === 'park') return fill(layer, c.park)
          if (id === 'landcover_wood') return fill(layer, c.wood)
          if (id === 'landuse_residential') return fill(layer, c.residential)
          if (id === 'building') return fill(layer, c.building, { 'fill-outline-color': c.building })
          if (id === 'landcover_glacier' || id === 'landcover_ice_shelf') return fill(layer, c.ice)
          // Anything else (aeroway areas are dropped above): a faint residential wash
          return fill(layer, c.residential, { 'fill-opacity': 0.5 })
        }

        case 'line': {
          if (id === 'waterway') return { ...layer, paint: { ...layer.paint, 'line-color': c.waterway } }
          if (id === 'boundary_3') return { ...layer, paint: { ...layer.paint, 'line-color': c.boundaryMinor } }
          if (id.startsWith('boundary')) return { ...layer, paint: { ...layer.paint, 'line-color': c.boundary } }
          if (id.includes('casing')) return { ...layer, paint: { ...layer.paint, 'line-color': c.roadCasing } }
          // Inner road lines, minor roads and subtle strokes
          return { ...layer, paint: { ...layer.paint, 'line-color': c.road } }
        }

        case 'symbol': {
          const halo = { 'text-halo-color': c.land, 'text-halo-width': 1.2, 'text-halo-blur': 0 }
          if (id.startsWith('label_country'))
            return {
              ...layer,
              layout: {
                ...layer.layout,
                'text-font': ['Noto Sans Regular'],
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.24,
              },
              paint: { ...halo, 'text-color': c.graphite },
            }
          if (id === 'label_city' || id === 'label_city_capital' || id === 'label_town')
            return {
              ...layer,
              layout: { ...layer.layout, 'text-font': ['Noto Sans Regular'] },
              paint: { ...halo, 'text-color': c.graphite },
            }
          if (id.startsWith('water_name') || id === 'waterway_line_label')
            return { ...layer, paint: { ...halo, 'text-color': c.waterLabel } }
          // States, villages, everything else: quieter
          return { ...layer, paint: { ...halo, 'text-color': c.stone } }
        }

        default:
          return layer
      }
    })

  return { ...style, layers }
}
