import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { DURATION, EASE, transition } from '../../lib/motion'

type Option<T extends string> = { value: T; label: string; icon?: ReactNode }

/**
 * A row of pills with the shared-layout `ink` fill (the SegmentedControl
 * pattern). `full` stretches the options to equal widths; otherwise the row
 * scrolls sideways when it runs out of room.
 */
export function PillChoice<T extends string>({
  label,
  layoutId,
  options,
  value,
  onChange,
  full = false,
}: {
  label: string
  layoutId: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  full?: boolean
}) {
  return (
    <div className={full ? '' : '-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0'}>
      <div
        role="group"
        aria-label={label}
        className={`items-center rounded-full border border-line bg-milk p-1 ${full ? 'grid auto-cols-fr grid-flow-col' : 'inline-flex'}`}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-body tracking-[-0.01em] whitespace-nowrap transition-colors duration-500 ease-cinematic ${
                active ? 'text-milk' : 'text-graphite-600 hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ duration: DURATION.ui, ease: EASE }}
                />
              )}
              {option.icon && <span className="relative">{option.icon}</span>}
              <span className="relative">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Panels that cross-fade in one place. The box is as tall as the active panel
 * (no empty space under a short one) and eases to the new height on a switch,
 * like an accordion panel, so the page below glides instead of jumping. The
 * inactive panel lies on top, invisible, out of the tab order and the
 * accessibility tree.
 */
export function StackedPanels<T extends string>({ active, panels }: { active: T; panels: Record<T, ReactNode> }) {
  // One element per panel: a ref handed from one motion element to another isn't re-attached
  const els = useRef<Partial<Record<T, HTMLDivElement | null>>>({})
  const [height, setHeight] = useState<number | 'auto'>('auto')

  // Follow the active panel's height, including changes inside it (an error line appearing)
  useLayoutEffect(() => {
    const el = els.current[active]
    if (!el) return
    setHeight(el.offsetHeight)
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [active])

  return (
    <motion.div
      initial={false}
      animate={{ height }}
      transition={transition(DURATION.ui)}
      // Clips the outgoing taller panel while it fades, with room for focus rings
      className="relative overflow-clip [overflow-clip-margin:8px]"
    >
      {(Object.keys(panels) as T[]).map((key) => {
        const on = key === active
        return (
          <motion.div
            key={key}
            ref={(el) => {
              els.current[key] = el
            }}
            initial={false}
            animate={{ opacity: on ? 1 : 0, y: on ? 0 : 8 }}
            transition={transition(DURATION.ui)}
            inert={!on}
            aria-hidden={!on}
            className={on ? 'relative' : 'pointer-events-none absolute inset-x-0 top-0'}
          >
            {panels[key]}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
