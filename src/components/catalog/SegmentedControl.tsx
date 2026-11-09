import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { DURATION, EASE } from '../../lib/motion'

type Option<T extends string> = { value: T; label: string; icon?: ReactNode }

type SegmentedControlProps<T extends string> = {
  /** Accessible group name, e.g. "Sort". */
  label: string
  /** Unique per control, for the shared-layout pill. */
  layoutId: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** Pill group with a shared-layout `ink` indicator (like the header nav). */
export function SegmentedControl<T extends string>({ label, layoutId, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-10 shrink-0 items-center rounded-full border border-line p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative flex h-8 items-center gap-1.5 rounded-full px-3 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic ${
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
  )
}
