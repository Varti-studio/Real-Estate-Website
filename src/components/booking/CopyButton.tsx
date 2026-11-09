import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, transition } from '../../lib/motion'

/** Copies `text`; `copied` stays true for a moment after. */
export function useCopy(text: string) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      /* no clipboard access: the reference stays on screen to select */
    }
  }

  return { copied, copy }
}

type CopyButtonProps = {
  text: string
  /** Accessible name, e.g. "Copy booking reference HXQ-4821". */
  label: string
  /** Rendered with `copied`, so the content can swap its icon. */
  children: (copied: boolean) => ReactNode
  className?: string
  /** Where the "Copied" pill appears. */
  tooltip?: 'above' | 'below'
}

/** A button that copies text and shows a small ink "Copied" pill, announced politely. */
export function CopyButton({ text, label, children, className = '', tooltip = 'above' }: CopyButtonProps) {
  const { copied, copy } = useCopy(text)

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={copy} aria-label={label} className={className}>
        {children(copied)}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
      <AnimatePresence>
        {copied && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: tooltip === 'above' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transition(DURATION.micro)}
            className={`pointer-events-none absolute left-1/2 z-10 -ml-10 inline-flex h-7 w-20 items-center justify-center rounded-full bg-ink font-mono text-label tracking-label text-milk uppercase ${
              tooltip === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            Copied
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
