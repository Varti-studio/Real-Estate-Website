import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { DURATION, transition } from '../../lib/motion'
import { Link } from '../../lib/router'

const STEPS = ['Dates and guests', 'Confirm and pay', 'Booked'] as const

/**
 * Three steps: a compact progress line on phones, and from `sm` the full row on hairlines. Done steps are `accent` circles with a tick (the
 * first links back to the stay), the current one is an `accent` number, the next
 * a hairline circle. The hairline into a done step fills from the left.
 */
export function CheckoutSteps({ current, backTo, lastLabel = STEPS[2] }: { current: 1 | 2; backTo: string; lastLabel?: string }) {
  // `current` is the 0-based active step: 1 while paying, 2 once booked (all done)
  const labels = [STEPS[0], STEPS[1], lastLabel]
  return (
    <>
      <CompactSteps labels={labels} current={current} />
      <FullSteps labels={labels} current={current} backTo={backTo} />
    </>
  )
}

/**
 * Below `sm` the three steps don't fit on a line, so one mono line names the
 * current step over three hairline segments that fill `ink` as you go.
 */
function CompactSteps({ labels, current }: { labels: string[]; current: 1 | 2 }) {
  const shown = Math.min(current, labels.length - 1)
  const finished = current === 2
  return (
    <div className="sm:hidden">
      <p className="flex items-center gap-2 font-mono text-label tracking-label text-graphite-600 uppercase tabular-nums">
        {finished ? <Check size={14} strokeWidth={1.5} aria-hidden className="text-accent" /> : null}
        <span>
          Step {shown + 1} of {labels.length}
        </span>
        <span aria-hidden>·</span>
        <span className="text-ink">{labels[shown]}</span>
      </p>
      <div aria-hidden className="mt-3 grid grid-cols-3 gap-2">
        {labels.map((label, i) => (
          <span key={label} className="relative h-0.5 overflow-hidden rounded-full bg-line">
            <motion.span
              initial={false}
              animate={{ scaleX: i <= current ? 1 : 0 }}
              transition={transition(DURATION.ui)}
              className="absolute inset-0 origin-left bg-accent"
            />
          </span>
        ))}
      </div>
    </div>
  )
}

function FullSteps({ labels, current, backTo }: { labels: string[]; current: 1 | 2; backTo: string }) {
  return (
    <ol className="hidden flex-wrap items-center gap-x-4 gap-y-3 sm:flex">
      {labels.map((label, i) => {
        const done = i < current || (current === 2 && i === 2)
        const active = i === current && !done
        const circle = (
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-label tabular-nums transition-colors duration-500 ease-cinematic ${
              done || active ? 'bg-accent text-milk' : 'border border-line text-stone-500'
            }`}
          >
            {done ? <Check size={14} strokeWidth={1.5} aria-hidden /> : i + 1}
          </span>
        )
        const text = (
          <span className={`text-body tracking-[-0.01em] ${active ? 'text-ink' : done ? 'text-graphite-600' : 'text-stone-500'}`}>
            {label}
            {done && <span className="sr-only"> (done)</span>}
          </span>
        )
        return (
          <Fragment key={label}>
            {i > 0 && (
              <li aria-hidden className="relative h-px w-10 bg-line lg:w-16">
                <motion.span
                  initial={false}
                  animate={{ scaleX: i <= current ? 1 : 0 }}
                  transition={transition(DURATION.ui)}
                  className="absolute inset-0 origin-left bg-accent"
                />
              </li>
            )}
            <li aria-current={active ? 'step' : undefined}>
              {i === 0 && current < 2 ? (
                <Link
                  to={backTo}
                  className="group flex items-center gap-2.5 rounded-full underline-offset-4 hover:[&>span:last-child]:text-ink hover:[&>span:last-child]:underline"
                >
                  {circle}
                  {text}
                </Link>
              ) : (
                <span className="flex items-center gap-2.5">
                  {circle}
                  {text}
                </span>
              )}
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
