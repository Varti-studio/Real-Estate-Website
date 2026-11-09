import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { pageList } from '../../lib/catalog'
import { DURATION, EASE } from '../../lib/motion'

type PaginationProps = {
  page: number
  total: number
  onChange: (page: number) => void
  /** Shared-layout id of the current-page pill; give each pagination on a page its own. */
  layoutId?: string
  /** Inside a frame that already draws the hairline (a sheet footer): no top border or padding. */
  bare?: boolean
  /** Smaller circles below `sm`, for narrow frames such as a full-width sheet on a phone. */
  compact?: boolean
}

/** Centred `< 1 2 3 … 18 >` with a shared-layout `ink` pill on the current page. */
export function Pagination({ page, total, onChange, layoutId = 'catalog-page', bare = false, compact = false }: PaginationProps) {
  const size = compact ? 'size-8 sm:size-10' : 'size-10'
  return (
    <div className={`flex justify-center ${bare ? 'w-full' : 'border-t border-line pt-6'}`}>
      {total > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <StepButton label="Previous page" size={size} disabled={page <= 1} onClick={() => onChange(page - 1)}>
            <ChevronLeft size={16} strokeWidth={1.5} />
          </StepButton>
          {pageList(page, total).map((item, i) =>
            item === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden className={`grid ${size} place-items-center font-mono text-body text-stone-500`}>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={`relative grid ${size} place-items-center rounded-full font-mono text-body tabular-nums transition-colors duration-500 ease-cinematic ${
                  item === page ? 'text-milk' : 'text-graphite-600 hover:text-ink'
                }`}
              >
                {item === page && (
                  <motion.span
                    layoutId={layoutId}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: DURATION.ui, ease: EASE }}
                  />
                )}
                <span className="relative">{item}</span>
              </button>
            ),
          )}
          <StepButton label="Next page" size={size} disabled={page >= total} onClick={() => onChange(page + 1)}>
            <ChevronRight size={16} strokeWidth={1.5} />
          </StepButton>
        </nav>
      )}
    </div>
  )
}

function StepButton({
  label,
  size,
  disabled,
  onClick,
  children,
}: {
  label: string
  size: string
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
      className={`grid ${size} place-items-center rounded-full border border-line text-ink transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk disabled:pointer-events-none disabled:text-stone-300`}
    >
      {children}
    </button>
  )
}
