import { useState } from 'react'

const KEY = 'solum:wishlist'

const read = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

/** Saved stays, per viewer. Storage can be missing (private mode): the choice then lasts this visit. */
export function useWishlist(id: string) {
  const [saved, setSaved] = useState(() => read().includes(id))

  const toggle = () => {
    const next = !saved
    setSaved(next)
    try {
      const ids = read().filter((v) => v !== id)
      localStorage.setItem(KEY, JSON.stringify(next ? [...ids, id] : ids))
    } catch {
      /* private mode */
    }
  }

  return [saved, toggle] as const
}
