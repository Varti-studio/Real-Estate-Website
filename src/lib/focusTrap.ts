import type { KeyboardEvent } from 'react'

/** Keeps Tab / Shift+Tab cycling inside `container` (modal sheets). Call from its keydown handler. */
export function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return
  const focusable = [
    ...container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'),
  ].filter((el) => el.getClientRects().length > 0)
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first) return
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
