import type { ReactNode } from 'react'

type TagProps = {
  children: ReactNode
  tone?: 'paper' | 'photo' | 'dark'
  className?: string
}

/** Stylized mono badge. Use `tone="photo"` on top of imagery, `tone="dark"` on ink. */
export function Tag({ children, tone = 'paper', className = '' }: TagProps) {
  const tones = {
    paper: 'border border-line text-graphite-600',
    photo: 'bg-milk/85 text-ink backdrop-blur-md',
    /** On ink surfaces (the footer panel). */
    dark: 'border border-milk/15 text-milk/70',
  }

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 font-mono text-label tracking-label uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
