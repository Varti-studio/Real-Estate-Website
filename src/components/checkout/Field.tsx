import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, CircleAlert } from 'lucide-react'
import { DURATION, transition } from '../../lib/motion'

type FieldProps = {
  id: string
  label: string
  error?: string
  /** Right-aligned inside the box, e.g. the card brand or a chevron. */
  trailing?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * A form box: a mono label above the value, a `line` border that goes `ink`
 * on focus or error, and the problem fading in beneath it. The control inside
 * gets `CONTROL` and points `aria-describedby` at `errorId(id)`.
 */
export function Field({ id, label, error, trailing, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`flex cursor-text items-center gap-3 rounded-card border bg-milk px-4 pt-2.5 pb-2 transition-[border-color,box-shadow] duration-500 ease-cinematic focus-within:border-ink focus-within:ring-1 focus-within:ring-ink ${
          error ? 'border-ink' : 'border-line hover:border-stone-500'
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-mono text-label tracking-label text-graphite-600 uppercase">{label}</span>
          {children}
        </span>
        {trailing}
      </label>
      <FieldError id={errorId(id)} error={error} />
    </div>
  )
}

export const errorId = (id: string) => `${id}-error`

/** The input / select / textarea inside a `Field`: borderless, 16px (no zoom on iOS). */
export const CONTROL =
  'w-full min-w-0 appearance-none bg-transparent text-body text-ink tabular-nums placeholder:text-stone-500 focus-visible:outline-none'

/** A field's problem: mono, graphite, an icon — no red. */
export function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          id={id}
          key={error}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: transition(DURATION.micro * 0.6) }}
          transition={transition(DURATION.micro)}
          className="mt-2 flex items-center gap-1.5 font-mono text-label text-graphite-600"
        >
          <CircleAlert size={12} strokeWidth={1.5} aria-hidden className="shrink-0 text-ink" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/** The chevron of a native select inside a `Field`. */
export const SelectChevron = () => <ChevronDown size={16} strokeWidth={1.5} aria-hidden className="pointer-events-none shrink-0" />

/** A real checkbox drawn as an `ink` square with a hairline tick, with a mono label like the field hints. */
export function Checkbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label htmlFor={id} className="group flex cursor-pointer items-start gap-3 font-mono text-label text-graphite-600">
      {/* 20px box centred on the first 16px line */}
      <span className="relative -mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border border-stone-300 transition-colors duration-500 ease-cinematic group-hover:border-ink checked:border-ink checked:bg-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
        />
        <Check
          size={14}
          strokeWidth={1.5}
          aria-hidden
          className="pointer-events-none relative text-milk opacity-0 transition-opacity duration-500 ease-cinematic peer-checked:opacity-100"
        />
      </span>
      {/* Runs to the line's end (labels balance their lines by default) */}
      <span className="[text-wrap:pretty]">{children}</span>
    </label>
  )
}

/**
 * Reformats an input's value ("4242 4242 …", "09 / 29") without throwing the
 * caret to the end: it lands after the same number of digits it followed
 * before, so a digit can be fixed in the middle of the number.
 */
export function reformat(input: HTMLInputElement, format: (value: string) => string) {
  const raw = input.value
  const caret = input.selectionStart ?? raw.length
  const next = format(raw)
  let pos = next.length
  if (caret < raw.length) {
    const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length
    pos = 0
    for (let seen = 0; pos < next.length && seen < digitsBefore; pos++) if (/\d/.test(next[pos])) seen++
  }
  // After React writes the new value
  requestAnimationFrame(() => {
    if (document.activeElement === input) input.setSelectionRange(pos, pos)
  })
  return next
}
