import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { CONFIRMATION } from '../../data/copy'
import { STAGGER, fadeUp, lineReveal, markCircle, markTick, staggerContainer } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import { accent } from '../stay/text'
import { CopyButton } from './CopyButton'
import { hostName, type Trip } from './trip'

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The success mark, "You are booked, Olena", where the confirmation went, and the code. */
export function SuccessHero({ trip }: { trip: Trip }) {
  const { booking, stay, story } = trip
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus({ preventScroll: true }), [])

  const name = booking.guest.firstName
  const lead = stay.instantBook ? 'You are booked,' : 'Request sent,'
  const host = hostName(story)
  const body = stay.instantBook
    ? `${capitalise(host)} has been notified. Your confirmation is on its way to ${booking.guest.email}.`
    : `${CONFIRMATION.request.body(capitalise(host))} A copy of your request is on its way to ${booking.guest.email}.`

  return (
    <motion.section
      aria-labelledby="booked-title"
      variants={staggerContainer(STAGGER.base, 0.1)}
      initial="hidden"
      animate="visible"
      className="border-b border-line bg-milk"
    >
      <div className="container-x flex flex-col items-center py-16 text-center lg:py-24">
        <motion.span variants={markCircle} className="grid size-16 place-items-center rounded-full bg-ink text-milk">
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <motion.path variants={markTick} d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </motion.span>

        <h1
          id="booked-title"
          ref={heading}
          tabIndex={-1}
          aria-label={`${lead} ${name}`}
          className="mt-10 max-w-[18ch] text-h2 font-light focus-visible:outline-none lg:mt-12"
        >
          <span aria-hidden className="block overflow-hidden pb-[0.12em]">
            <motion.span variants={lineReveal} className="block">
              {lead}
              {NBSP}
              {accent(name)}
            </motion.span>
          </span>
        </h1>

        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-body leading-[1.55] text-graphite-600">
          {typeset(body)}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10">
          <CopyButton
            text={booking.ref}
            label={`Copy confirmation code ${booking.ref}`}
            className="group flex h-12 items-center gap-4 rounded-full border border-line bg-paper pr-2 pl-5 transition-colors duration-500 ease-cinematic hover:border-ink focus-visible:border-ink"
          >
            {(copied) => (
              <>
                <span className="font-mono text-label tracking-label text-graphite-600 uppercase">Confirmation code</span>
                <span className="font-mono text-body tracking-[0.04em] text-ink tabular-nums">{booking.ref}</span>
                <span className="grid size-8 place-items-center rounded-full bg-milk text-ink transition-colors duration-500 ease-cinematic group-hover:bg-ink group-hover:text-milk group-focus-visible:bg-ink group-focus-visible:text-milk">
                  {copied ? <Check size={14} strokeWidth={1.5} aria-hidden /> : <Copy size={14} strokeWidth={1.5} aria-hidden />}
                </span>
              </>
            )}
          </CopyButton>
        </motion.div>
      </div>
    </motion.section>
  )
}
