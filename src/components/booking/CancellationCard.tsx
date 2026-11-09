import { ArrowRight } from 'lucide-react'
import { cancellationStatus } from '../../lib/checkout'
import { goTo } from '../../lib/router'
import { typeset } from '../../lib/typography'
import { mailUs, type Trip } from './trip'

const ACTION =
  'inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk focus-visible:border-ink'

/**
 * Where this booking stands in the one cancellation policy (data/copy.ts),
 * dated from the day it was made. Changes go through us by email until accounts exist.
 */
export function CancellationCard({ trip }: { trip: Trip }) {
  const { booking, today } = trip
  const { stage, steps, sentence } = cancellationStatus(booking.checkIn, booking.bookedOn, today)
  const started = today >= booking.checkIn

  return (
    <section aria-labelledby="cancellation-title" className="flex h-full flex-col rounded-card border border-line bg-milk p-6 lg:p-8">
      <h2 id="cancellation-title" className="text-title tracking-[-0.02em]">
        Cancellation
      </h2>
      <p className="mt-4 max-w-[48ch] text-body leading-[1.55] text-graphite-600 tabular-nums">{typeset(sentence)}</p>

      <ol className="mt-6 font-mono text-label tabular-nums">
        {steps.map((step) => {
          const current = step.stage === stage && !started
          return (
            <li
              key={step.stage}
              aria-current={current ? 'step' : undefined}
              className={`flex items-baseline justify-between gap-4 border-t border-line py-3 ${current ? 'text-ink' : 'text-graphite-600'}`}
            >
              <span>{step.when}</span>
              <span className="flex items-baseline gap-3">
                {current && <span className="text-label tracking-label uppercase">Now ·</span>}
                {step.refund}
              </span>
            </li>
          )
        })}
      </ol>

      {/* The two actions share one row (splitting the width on a phone), the policy link sits under them */}
      <div className="mt-auto flex flex-col items-start gap-5 border-t border-line pt-6 print:hidden">
        <div className="flex w-full gap-3 sm:w-auto">
          <a href={mailUs('Change dates', booking.ref)} className={`${ACTION} flex-1 whitespace-nowrap sm:flex-none`}>
            Change dates
          </a>
          {!started && (
            <a href={mailUs('Cancel booking', booking.ref)} className={`${ACTION} flex-1 whitespace-nowrap sm:flex-none`}>
              Cancel booking
            </a>
          )}
        </div>
        <a
          href="/#faq"
          onClick={(e) => {
            e.preventDefault()
            goTo('/#faq')
          }}
          className="group inline-flex items-center gap-2 text-body text-ink"
        >
          <span className="relative">
            Full policy
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-cinematic group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
          </span>
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  )
}
