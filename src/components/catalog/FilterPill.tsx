import type { ReactNode, Ref } from 'react'
import { ChevronDown } from 'lucide-react'

type FilterPillProps = {
  label: string
  /** Current value preview ("€400–€600"); shown instead of the label when set. */
  value?: string
  icon?: ReactNode
  onClick: () => void
  ref?: Ref<HTMLButtonElement>
} & (
  | { kind: 'menu'; expanded: boolean; controls?: string }
  /** On/off filter, filled `ink` when pressed. */
  | { kind: 'toggle'; pressed: boolean }
)

/** Pill in the catalogue filter row: opens a panel (`menu`) or flips a filter (`toggle`). */
export function FilterPill(props: FilterPillProps) {
  const { label, value, icon, onClick, ref } = props
  const on = props.kind === 'toggle' ? props.pressed : !!value
  const open = props.kind === 'menu' && props.expanded

  const tone =
    props.kind === 'toggle' && props.pressed
      ? 'border-ink bg-ink text-milk hover:bg-graphite-800'
      : on || open
        ? 'border-ink bg-milk text-ink'
        : 'border-line text-ink hover:border-ink hover:bg-milk'

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={props.kind === 'toggle' ? props.pressed : undefined}
      aria-haspopup={props.kind === 'menu' ? 'dialog' : undefined}
      aria-expanded={props.kind === 'menu' ? props.expanded : undefined}
      aria-controls={props.kind === 'menu' && props.expanded ? props.controls : undefined}
      aria-label={value && value !== label ? `${label}: ${value}` : undefined}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border text-body tracking-[-0.01em] whitespace-nowrap transition-colors duration-500 ease-cinematic ${tone} ${
        props.kind === 'toggle' ? 'px-4' : 'pr-3.5 pl-4'
      }`}
    >
      {icon}
      <span>{value || label}</span>
      {props.kind === 'menu' && (
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          aria-hidden
          className={`transition-transform duration-500 ease-cinematic ${open ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  )
}
