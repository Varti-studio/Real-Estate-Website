import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Variant = 'primary' | 'light' | 'ghost' | 'ghost-light' | 'outline'
type Size = 'md' | 'lg'

type ButtonProps = {
  variant?: Variant
  size?: Size
  icon?: ReactNode | false
  href?: string
} & Omit<ComponentPropsWithoutRef<'a'>, 'href'>

const base =
  'group/btn inline-flex shrink-0 items-center justify-center gap-3 rounded-full text-body tracking-[-0.01em] whitespace-nowrap transition-colors duration-500 ease-cinematic'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-milk hover:bg-graphite-800',
  /** Primary on dark surfaces (mobile menu, photos). */
  light: 'bg-milk text-ink hover:bg-sand',
  ghost: 'border border-line text-ink hover:border-ink hover:bg-ink hover:text-milk',
  /** Ink outline on a transparent fill; fills ink on hover (the header's Sign up). */
  outline: 'border border-ink text-ink hover:bg-ink hover:text-milk',
  'ghost-light':
    'border border-milk/30 text-milk backdrop-blur-sm hover:border-milk hover:bg-milk hover:text-ink',
}

const sizes: Record<Size, string> = {
  md: 'h-11 pl-5 pr-4',
  lg: 'h-13 pl-6 pr-5 text-body',
}

/** Pill button (rendered as a link). The arrow drifts on hover. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  href = '#',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const glyph =
    icon === false ? null : (icon ?? <ArrowUpRight size={16} strokeWidth={1.5} />)

  return (
    <a href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      <span>{children}</span>
      {glyph && (
        <span className="transition-transform duration-500 ease-cinematic group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 group-focus-visible/btn:translate-x-1">
          {glyph}
        </span>
      )}
    </a>
  )
}
