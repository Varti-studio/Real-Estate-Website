import type { ReactNode } from 'react'

type MonoLabelProps = {
  children: ReactNode
  className?: string
}

/** Small uppercase mono metadata label, e.g. section indices or coordinates. */
export function MonoLabel({ children, className = '' }: MonoLabelProps) {
  return <span className={`eyebrow tabular-nums ${className}`}>{children}</span>
}
