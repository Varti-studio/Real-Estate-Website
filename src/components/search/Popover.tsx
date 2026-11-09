import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, transition } from '../../lib/motion'

type PopoverProps = {
  open: boolean
  id: string
  /** Positioning classes for the outer wrapper (it owns `translate`, the inner panel owns motion). */
  placement: string
  /** Accessible name; renders the panel as a non-modal dialog. Omit for listbox popovers. */
  label?: string
  /** 'up' when the bar is docked at the bottom of the hero; 'down' when it sits at the top of a page. */
  direction?: 'up' | 'down'
  className?: string
  children: ReactNode
}

/**
 * Floating panel for the desktop search bar.
 */
export function Popover({ open, id, placement, label, direction = 'up', className = '', children }: PopoverProps) {
  const up = direction === 'up'
  return (
    <AnimatePresence>
      {open && (
        <div className={`absolute z-30 ${up ? 'bottom-full mb-3' : 'top-full mt-3'} ${placement}`}>
          <motion.div
            id={id}
            role={label ? 'dialog' : undefined}
            aria-label={label}
            initial={{ opacity: 0, y: up ? 10 : -10, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.99, filter: 'blur(2px)', transition: transition(DURATION.micro * 0.6) }}
            transition={transition(DURATION.micro)}
            style={{ transformOrigin: up ? 'bottom center' : 'top center' }}
            className={`rounded-frame border border-line bg-milk text-ink shadow-soft ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
