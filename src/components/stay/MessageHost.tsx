import { Fragment, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { MESSAGE } from '../../data/copy'
import type { Stay } from '../../data/stays'
import { PROVIDER_LABELS, accountLabel, setAccount, useAccount } from '../../lib/account'
import { formatRange } from '../../lib/dates'
import { DURATION, STAGGER, fadeUp, markCircle, markTick, staggerContainer } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import type { StayParams, Story } from '../../lib/stay'
import { CONTROL, Field, errorId } from '../checkout/Field'
import { guestsLabel } from '../checkout/TripSummary'
import { MonoLabel } from '../ui/MonoLabel'
import { Sheet } from '../ui/Sheet'
import { HostAvatar } from './HostAvatar'
import { MessageSignIn, type AuthMode } from './MessageSignIn'
import { accent } from './text'

type MessageHostProps = {
  open: boolean
  onClose: () => void
  stay: Stay
  story: Story
  /** What the guest has picked so far (stay page) or booked (confirmation). */
  trip: StayParams
  /** The booking reference, on the confirmation page. */
  reference?: string
  /** The booking's guest, to start the sign-up form with. */
  prefill?: { firstName: string; email: string }
}

const PILL =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-body tracking-[-0.01em] text-milk transition-colors duration-500 ease-cinematic hover:bg-graphite-800 focus-visible:bg-graphite-800'

/** "Replies within an hour" → "replies within an hour" */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/**
 * A side sheet to write to the host. The Message button is there for everyone;
 * without an account the sheet first asks to log in or sign up
 * (`MessageSignIn`), because a conversation belongs to an account: it is saved
 * and replies have somewhere to go. Signed in, it shows the host's portrait and
 * reply time, the message, and quick-question chips that add or remove their
 * line. Dates and guests already picked open the message as a
 * greeting, kept in step if they change while the draft is untouched below it.
 * There is no messaging backend yet, so Send shows the sent state with a
 * prototype note. A draft survives closing the sheet; a sent message clears it.
 */
export function MessageHost({ open, onClose, stay, story, trip, reference, prefill }: MessageHostProps) {
  const uid = useId()
  const form = useRef<HTMLFormElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const account = useAccount()
  const [authMode, setAuthMode] = useState<AuthMode>(prefill ? 'signup' : 'login')
  const reset = useRef(0)
  useEffect(() => () => window.clearTimeout(reset.current), [])

  const named = story.host.name !== 'Your host'
  const host = named ? story.host.name : 'the host'
  const Host = named ? host : 'The host'

  // "Hi Sigrún, we would like to stay 10–13 Nov, 2 adults."
  const party = trip.adults + trip.children > 0 ? guestsLabel(trip).replace(/ · /g, ', ') : ''
  const tripLine = trip.checkIn && trip.checkOut ? [formatRange(trip.checkIn, trip.checkOut), party].filter(Boolean).join(', ') : ''
  const greeting = tripLine ? MESSAGE.greeting(named ? host : 'there', tripLine, reference) : ''

  // The greeting leads the draft; when the dates change it is swapped, the guest's own words kept
  const lastGreeting = useRef('')
  useEffect(() => {
    if (!open) return
    const previous = lastGreeting.current
    lastGreeting.current = greeting
    setText((current) => {
      if (!current.startsWith(previous)) return current
      const rest = current.slice(previous.length).replace(/^\n/, '')
      return [greeting, rest].filter(Boolean).join('\n')
    })
  }, [open, greeting])

  const edit = (next: string) => {
    setText(next)
    if (error && next.trim().length >= 10) setError('')
  }

  const lines = text.split('\n')
  const toggle = (line: string) => {
    const next = lines.includes(line)
      ? lines.filter((l) => l !== line).join('\n')
      : [text.trimEnd(), line].filter(Boolean).join('\n')
    edit(next)
    requestAnimationFrame(() => {
      const el = textarea.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 10) {
      setError(`Write a few words to ${host}`)
      textarea.current?.focus()
      return
    }
    setSent(true)
  }

  // A sent message makes way for a fresh one, once the sheet has slid out
  const close = () => {
    onClose()
    if (!sent) return
    window.clearTimeout(reset.current)
    reset.current = window.setTimeout(() => {
      setSent(false)
      setText('')
      lastGreeting.current = ''
    }, DURATION.ui * 1000)
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={`Message ${host}`}
      footer={
        sent ? (
          <button type="button" onClick={close} className={`ml-auto ${PILL}`}>
            Done
          </button>
        ) : (
          <button type="submit" form={account ? `${uid}-form` : `${uid}-auth`} className={`group ml-auto ${PILL}`}>
            {account ? 'Send message' : authMode === 'login' ? 'Log in and continue' : 'Sign up and continue'}
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              aria-hidden
              className="transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-0.5 group-focus-visible:translate-x-1"
            />
          </button>
        )
      }
    >
      {sent ? (
        // Keyed, so React mounts it fresh instead of reusing the form's first block (and its reveal state)
        <motion.div
          key="sent"
          variants={staggerContainer(STAGGER.base)}
          initial="hidden"
          animate="visible"
          aria-live="polite"
          className="flex flex-col items-start py-10"
        >
          <motion.span variants={markCircle} className="grid size-16 place-items-center rounded-full bg-ink text-milk">
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <motion.path variants={markTick} d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </motion.span>
          <motion.h3 variants={fadeUp} className="mt-8 text-h3 font-light">
            Message sent to{NBSP}{named ? accent(host) : 'the host'}
          </motion.h3>
          <motion.p variants={fadeUp} className="mt-4 text-body leading-[1.55] text-graphite-600">
            {typeset(`${Host} usually ${lower(story.host.responds)}. ${account ? MESSAGE.replies(accountLabel(account)) : ''}`)}
          </motion.p>
          <motion.figure variants={fadeUp} className="mt-8 w-full rounded-card border border-line bg-paper p-5">
            <MonoLabel>Your message</MonoLabel>
            <blockquote className="mt-3 text-body leading-[1.55] whitespace-pre-wrap text-ink">{text.trim()}</blockquote>
          </motion.figure>
          <motion.p variants={fadeUp} className="mt-6 font-mono text-label text-graphite-600">
            {MESSAGE.prototype}
          </motion.p>
        </motion.div>
      ) : (
        // Keyed by step, so signing in mounts the message form fresh (with its reveal)
        <Fragment key={account ? 'compose' : 'auth'}>
          {/* Who reads it */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 border-b border-line py-6">
            <HostAvatar name={named ? host : stay.name} photo={story.host.photo} className="size-14 text-title" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-body tracking-[-0.01em]">{named ? host : 'Your host'}</span>
              <span className="font-mono text-label text-graphite-600">{typeset(`Host of ${stay.name} · ${lower(story.host.responds)}`)}</span>
            </div>
          </motion.div>

          {!account ? (
            <MessageSignIn formId={`${uid}-auth`} mode={authMode} onModeChange={setAuthMode} host={host} prefill={prefill} />
          ) : (
            <form id={`${uid}-form`} ref={form} onSubmit={submit} noValidate className="flex flex-col gap-6 pt-6 pb-8">
              <motion.div variants={fadeUp}>
                <Field id={`${uid}-text`} label="Message" error={error}>
                  <textarea
                    id={`${uid}-text`}
                    ref={textarea}
                    value={text}
                    onChange={(e) => edit(e.target.value)}
                    rows={7}
                    maxLength={MESSAGE.maxLength}
                    placeholder={`Ask ${host} about the house, the way in or your dates`}
                    aria-invalid={!!error}
                    aria-describedby={`${errorId(`${uid}-text`)} ${uid}-count`}
                    className={`${CONTROL} mt-1 resize-none leading-[1.55]`}
                  />
                </Field>
                <p id={`${uid}-count`} className="mt-2 text-right font-mono text-label text-graphite-600 tabular-nums">
                  {`${text.length} / ${MESSAGE.maxLength}`}
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col gap-3">
                <MonoLabel>Quick questions</MonoLabel>
                <div className="flex flex-wrap gap-2">
                  {MESSAGE.starters.map((starter) => {
                    const added = lines.includes(starter.text)
                    return (
                      <button
                        key={starter.label}
                        type="button"
                        onClick={() => toggle(starter.text)}
                        aria-pressed={added}
                        className={`inline-flex h-9 items-center rounded-full border px-4 text-body tracking-[-0.01em] transition-colors duration-500 ease-cinematic ${
                          added ? 'border-ink bg-ink text-milk' : 'border-line text-ink hover:border-ink focus-visible:border-ink'
                        }`}
                      >
                        {starter.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              <motion.p variants={fadeUp} className="border-t border-line pt-4 font-mono text-label text-graphite-600">
                {account.provider && !account.email ? 'Signed in with ' : 'Signed in as '}
                <span className="text-ink">{account.email || PROVIDER_LABELS[account.provider!]}</span>
                {' · '}
                <button
                  type="button"
                  onClick={() => setAccount(null)}
                  className="text-ink underline decoration-line underline-offset-4 transition-colors duration-500 ease-cinematic hover:decoration-ink focus-visible:decoration-ink"
                >
                  Log out
                </button>
              </motion.p>
            </form>
          )}
        </Fragment>
      )}
    </Sheet>
  )
}
