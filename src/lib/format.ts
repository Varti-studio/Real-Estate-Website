/** Two-digit mono counts: 4 → "04". */
export const pad = (n: number) => String(n).padStart(2, '0')

export const priceFormat = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/**
 * Coordinates rounded to one decimal (about 10 km), for display only: the
 * exact location is shared 48 hours before check-in.
 * "64.2559° N · 21.1299° W" → "64.3° N · 21.1° W".
 */
export const roughCoordinates = (coordinates: string) =>
  coordinates.replace(/([\d.]+)°\s*([NSEW])/g, (_, n: string, dir: string) => `${Number(n).toFixed(1)}° ${dir}`)

const monthYearFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** ISO month to a short label: "2026-09" → "Sept 2026". */
export const monthYear = (isoMonth: string) => monthYearFormat.format(new Date(`${isoMonth}-01T00:00:00Z`))
