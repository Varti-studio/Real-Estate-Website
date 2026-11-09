import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

/** `+` / `—` pill in a map's top-right corner. */
export function ZoomControls({ onZoom }: { onZoom: (by: 1 | -1) => void }) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col overflow-hidden rounded-full border border-line bg-milk shadow-soft">
      <ZoomButton label="Zoom in" onClick={() => onZoom(1)}>
        <Plus size={16} strokeWidth={1.5} />
      </ZoomButton>
      <span aria-hidden className="mx-2.5 h-px bg-line" />
      <ZoomButton label="Zoom out" onClick={() => onZoom(-1)}>
        <Minus size={16} strokeWidth={1.5} />
      </ZoomButton>
    </div>
  )
}

function ZoomButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center text-ink transition-colors duration-500 ease-cinematic hover:bg-ink hover:text-milk focus-visible:outline-offset-[-4px]"
    >
      {children}
    </button>
  )
}
