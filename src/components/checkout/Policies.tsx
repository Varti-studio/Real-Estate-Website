import { ArrowRight } from 'lucide-react'
import { CHECKOUT } from '../../data/copy'
import { cancellationSentence } from '../../lib/checkout'
import { pad } from '../../lib/format'
import { goTo } from '../../lib/router'
import { typeset } from '../../lib/typography'

/** The dated cancellation terms, with a link to the full policy (07 FAQ). */
export function CancellationTerms({ checkIn, booked }: { checkIn: string; booked: string }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <p className="max-w-2xl text-body leading-[1.55] text-graphite-600 tabular-nums">{typeset(cancellationSentence(checkIn, booked))}</p>
      <a
        href="/#faq"
        onClick={(e) => {
          e.preventDefault()
          goTo('/#faq')
        }}
        className="group inline-flex items-center gap-2 text-body text-ink"
      >
        <span className="relative">
          Read the full policy
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-cinematic group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
        </span>
        <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1" />
      </a>
    </div>
  )
}

/** The three things every guest agrees to, as numbered hairline rows. */
export function GroundRules() {
  return (
    <ol className="flex flex-col">
      {CHECKOUT.groundRules.map((rule, i) => (
        <li key={rule} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
          <span className="pt-0.5 font-mono text-label text-graphite-600 tabular-nums">{pad(i + 1)}</span>
          <span className="text-body leading-[1.55] text-ink">{typeset(rule)}</span>
        </li>
      ))}
    </ol>
  )
}
