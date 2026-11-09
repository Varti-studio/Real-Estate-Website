import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { trapFocus } from '../../lib/focusTrap'
import { DURATION, STAGGER, staggerContainer, transition } from '../../lib/motion'

type SheetProps = {
  open: boolean
  onClose: () => void
  /** Heading, and the dialog's accessible name. */
  title: string
  /** Mono count after the title, e.g. "(04)". */
  count?: number
  /** `side` slides in from the right (full screen on mobile); `full` covers the page. */
  variant?: 'side' | 'full'
  footer?: ReactNode
  /** Runs once the sheet has painted, with its scrolling body (e.g. to land on a section). */
  onOpened?: (body: HTMLDivElement) => void
  children: ReactNode
}

/**
 * Modal sheet: portalled to <body> (so no animated ancestor's `filter` traps
 * `position: fixed`), with scroll lock, a focus trap and Esc. Focus moves to
 * the close button and returns to the trigger on close. Children are a
 * staggered list: give them `variants={fadeUp}` to reveal in turn.
 */
export function Sheet({ open, onClose, title, count, variant = 'side', footer, onOpened, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const opened = useRef(onOpened)
  opened.current = onOpened
  const full = variant === 'full'

  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => {
      if (body.current) opened.current?.(body.current)
      panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    })
    return () => {
      document.body.style.overflow = ''
      cancelAnimationFrame(frame)
      trigger?.focus({ preventScroll: true })
    }
  }, [open])

  const motionProps = full
    ? { initial: { clipPath: 'inset(100% 0 0 0)' }, animate: { clipPath: 'inset(0% 0 0 0)' }, exit: { clipPath: 'inset(100% 0 0 0)' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {!full && (
            <motion.div
              aria-hidden
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition(DURATION.ui)}
              className="absolute inset-0 bg-ink/40"
            />
          )}
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            {...motionProps}
            transition={transition(DURATION.ui)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                onClose()
                return
              }
              trapFocus(e, panel.current)
            }}
            className={`flex flex-col text-ink ${
              full ? 'absolute inset-0 bg-paper' : 'absolute inset-y-0 right-0 w-full bg-milk sm:max-w-[520px] sm:rounded-l-frame'
            }`}
          >
            <header className={`shrink-0 border-b border-line ${full ? '' : 'px-6 sm:px-8'}`}>
              <div className={`flex h-20 items-center justify-between gap-4 ${full ? 'container-x' : ''}`}>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-title font-light tracking-[-0.03em]">{title}</h2>
                  {count !== undefined && count > 0 && (
                    <span className="font-mono text-label text-graphite-600 tabular-nums">({count})</span>
                  )}
                </div>
                <button
                  type="button"
                  data-autofocus
                  onClick={onClose}
                  aria-label={`Close ${title.toLowerCase()}`}
                  className="grid size-11 place-items-center rounded-full border border-line transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </header>

            <motion.div
              ref={body}
              variants={staggerContainer(STAGGER.tight, 0.15)}
              initial="hidden"
              animate="visible"
              className={`relative flex-1 overflow-y-auto overscroll-contain ${full ? '' : 'px-6 sm:px-8'}`}
            >
              {children}
            </motion.div>

            {footer && (
              <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-6 py-4 sm:px-8">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
