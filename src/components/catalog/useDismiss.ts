import { useEffect, useRef, type RefObject } from 'react'

/**
 * Closes a popover on an outside pointer or Esc. `onClose` learns which, so
 * Esc can hand focus back to the trigger.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: (reason: 'outside' | 'escape') => void,
) {
  // Latest callback without re-binding the listeners every render
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close.current('outside')
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current('escape')
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, ref])
}
