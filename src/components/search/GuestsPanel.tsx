import { useEffect, useId, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Minus, PawPrint, Plus } from 'lucide-react'
import { MAX_GUESTS, type Filters } from '../../lib/filters'
import { DURATION, EASE } from '../../lib/motion'

type Guests = Pick<Filters, 'adults' | 'children' | 'pets'>

type GuestsPanelProps = Guests & {
  onChange: (patch: Partial<Guests>) => void
  /** Focus the first control when mounted (keyboard-opened popover). */
  autoFocus?: boolean
}

export function GuestsPanel({ adults, children, pets, onChange, autoFocus = false }: GuestsPanelProps) {
  const first = useRef<HTMLDivElement>(null)
  const id = useId()
  const total = adults + children
  const full = total >= MAX_GUESTS

  useEffect(() => {
    if (autoFocus) first.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }, [autoFocus])

  return (
    <div className="flex flex-col">
      <div ref={first}>
        <StepperRow
          label="Adults"
          unit="adult"
          hint="Ages 13 or above"
          value={adults}
          // An adult must accompany children
          min={children > 0 ? 1 : 0}
          canAdd={!full}
          onChange={(v) => onChange({ adults: v })}
        />
      </div>
      <StepperRow
        label="Children"
        unit="child"
        hint="Ages 2 – 12"
        value={children}
        min={0}
        canAdd={!full}
        onChange={(v) => onChange({ children: v, adults: v > 0 && adults === 0 ? 1 : adults })}
      />

      <div className="flex items-center justify-between gap-6 py-5">
        <div className="flex items-start gap-3">
          <PawPrint size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink" />
          <div className="flex flex-col gap-1">
            <span id={`${id}-pets`} className="text-body tracking-[-0.01em]">
              Pet-friendly
            </span>
            <span id={`${id}-pets-hint`} className="text-body text-graphite-600">
              Only show stays that welcome pets
            </span>
          </div>
        </div>
        <Switch checked={pets} onChange={(v) => onChange({ pets: v })} labelledBy={`${id}-pets`} describedBy={`${id}-pets-hint`} />
      </div>

      <p className="border-t border-line pt-4 font-mono text-label text-graphite-600">
        {`Up to ${MAX_GUESTS} guests · infants stay free`}
      </p>
    </div>
  )
}

export function StepperRow({
  label,
  unit,
  hint,
  value,
  min,
  canAdd,
  onChange,
}: {
  label: string
  unit: string
  hint: string
  value: number
  min: number
  canAdd: boolean
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-5" role="group" aria-label={label}>
      <div className="flex flex-col gap-1">
        <span className="text-body tracking-[-0.01em]">{label}</span>
        <span className="text-body text-graphite-600">{hint}</span>
      </div>
      <div className="flex items-center gap-4">
        <StepButton label={`Remove one ${unit}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Minus size={14} strokeWidth={1.5} />
        </StepButton>
        <span className="w-6 text-center font-mono text-body tabular-nums" aria-live="polite">
          {value}
          <span className="sr-only"> {label.toLowerCase()}</span>
        </span>
        <StepButton label={`Add one ${unit}`} disabled={!canAdd} onClick={() => onChange(value + 1)}>
          <Plus size={14} strokeWidth={1.5} />
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-stone-300 text-ink transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk disabled:pointer-events-none disabled:border-line disabled:text-stone-300"
    >
      {children}
    </button>
  )
}

export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  labelledBy: string
  describedBy: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-500 ease-cinematic ${
        checked ? 'justify-end bg-ink' : 'justify-start bg-stone-300'
      }`}
    >
      <motion.span layout transition={{ duration: DURATION.micro, ease: EASE }} className="size-6 rounded-full bg-milk shadow-soft" />
    </button>
  )
}
