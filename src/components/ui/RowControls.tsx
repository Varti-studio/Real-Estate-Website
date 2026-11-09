import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ScrollRowState } from '../../lib/useScrollRow'

type RowControlsProps = {
  /** id of the scrolling list, for `aria-controls`. */
  controls: string
  /** What the row holds, for the button labels: "Previous stays". */
  noun: string
  state: ScrollRowState
  onPage: (dir: 1 | -1) => void
  className?: string
}

/** Prev/next circles, then a progress line whose thumb is the share of the row in view, offset by how far along it is. */
export function RowControls({ controls, noun, state, onPage, className = '' }: RowControlsProps) {
  return (
    <div className={`flex items-center gap-6 lg:gap-10 ${className}`}>
      <div className="flex shrink-0 items-center gap-2">
        <ArrowButton label={`Previous ${noun}`} controls={controls} disabled={state.atStart} onClick={() => onPage(-1)}>
          <ArrowLeft size={16} strokeWidth={1.5} />
        </ArrowButton>
        <ArrowButton label={`Next ${noun}`} controls={controls} disabled={state.atEnd} onClick={() => onPage(1)}>
          <ArrowRight size={16} strokeWidth={1.5} />
        </ArrowButton>
      </div>
      <div aria-hidden className="relative h-0.5 flex-1 overflow-hidden">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-transform duration-300 ease-cinematic"
          style={{
            width: `${state.visible * 100}%`,
            transform: `translateX(${state.progress * ((1 - state.visible) / state.visible) * 100}%)`,
          }}
        />
      </div>
    </div>
  )
}

function ArrowButton({
  label,
  controls,
  disabled,
  onClick,
  children,
}: {
  label: string
  controls: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full bg-ink text-milk transition-colors duration-500 ease-cinematic hover:bg-graphite-800 disabled:pointer-events-none disabled:bg-line disabled:text-milk"
    >
      {children}
    </button>
  )
}
