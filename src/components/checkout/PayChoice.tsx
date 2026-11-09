import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { formatShortDate } from '../../lib/dates'
import { SPLIT_MIN_DAYS, type PayPlan, type splitPlan } from '../../lib/checkout'
import { priceFormat } from '../../lib/format'
import { DURATION, transition } from '../../lib/motion'
import { typeset } from '../../lib/typography'
import { Rolling } from '../stay/BookingWidget'

type PayChoiceProps = {
  plan: PayPlan
  onChange: (plan: PayPlan) => void
  due: number
  split: ReturnType<typeof splitPlan>
  /** Request-to-book homes charge once the host accepts. */
  instant: boolean
  host: string
}

/** "Choose how to pay": two radio cards, the full amount or half now and half later. */
export function PayChoice({ plan, onChange, due, split, instant, host }: PayChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Choose how to pay</legend>
      <RadioCard
        name="pay-plan"
        checked={plan === 'full'}
        onSelect={() => onChange('full')}
        title={
          <>
            Pay <Rolling value={priceFormat.format(due)} /> {instant ? 'now' : `when ${host} accepts`}
          </>
        }
        body="Pay the full amount once and you are done."
      />
      <RadioCard
        name="pay-plan"
        checked={plan === 'split'}
        onSelect={() => onChange('split')}
        disabled={!split}
        title="Pay part now, the rest later"
        body={
          split
            ? typeset(
                `${priceFormat.format(split.now)} ${instant ? 'now' : 'on acceptance'}, ${priceFormat.format(split.later)} charged automatically on ${formatShortDate(split.dueISO)} ${split.dueISO.slice(0, 4)}. No extra fees.`,
              )
            : typeset(`Available when check-in is more than ${SPLIT_MIN_DAYS} days away.`)
        }
      />
    </fieldset>
  )
}

function RadioCard({
  name,
  checked,
  onSelect,
  disabled = false,
  title,
  body,
}: {
  name: string
  checked: boolean
  onSelect: () => void
  disabled?: boolean
  title: ReactNode
  body: string
}) {
  return (
    <label
      className={`group flex items-start gap-4 rounded-card border bg-milk p-5 transition-colors duration-500 ease-cinematic has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-accent ${
        disabled ? 'cursor-not-allowed border-line' : checked ? 'cursor-pointer border-ink' : 'cursor-pointer border-line hover:border-stone-500'
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} disabled={disabled} className="peer sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-500 ease-cinematic ${
          disabled ? 'border-stone-300' : checked ? 'border-accent' : 'border-stone-500 group-hover:border-ink'
        }`}
      >
        <motion.span
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={transition(DURATION.micro)}
          className="size-2.5 rounded-full bg-accent"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className={`text-body tracking-[-0.01em] tabular-nums ${disabled ? 'text-stone-500' : 'text-ink'}`}>{title}</span>
        <span className="text-body text-graphite-600 tabular-nums">{body}</span>
      </span>
    </label>
  )
}
