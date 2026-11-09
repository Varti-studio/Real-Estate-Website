import { useCallback, useState } from 'react'
import type { Filters, RecentSearch } from '../../lib/filters'

const KEY = 'solum.recent-searches'
const LIMIT = 3

/** Storage can be unavailable (private mode, blocked site data) — fail quietly. */
function load(): RecentSearch[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((r) => typeof r?.query === 'string' && r.query) : []
  } catch {
    return []
  }
}

function save(list: RecentSearch[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* per-viewer convenience only */
  }
}

/** The viewer's last few searches with a destination, newest first. */
export function useRecentSearches() {
  const [recent, setRecent] = useState<RecentSearch[]>(load)

  const record = useCallback((f: Filters) => {
    const query = f.query.trim()
    if (!query) return
    const entry: RecentSearch = {
      query,
      checkIn: f.checkIn,
      checkOut: f.checkOut,
      adults: f.adults,
      children: f.children,
      pets: f.pets,
    }
    setRecent((list) => {
      const next = [entry, ...list.filter((r) => r.query.toLowerCase() !== query.toLowerCase())].slice(0, LIMIT)
      save(next)
      return next
    })
  }, [])

  return { recent, record }
}
