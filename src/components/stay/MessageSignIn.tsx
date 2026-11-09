import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { MESSAGE } from '../../data/copy'
import { PASSWORD_MIN, PROVIDER_LABELS, isEmail } from '../../lib/account'
import { fadeUp } from '../../lib/motion'
import { typeset } from '../../lib/typography'
import { PillChoice, StackedPanels } from '../checkout/Choice'
import { CONTROL, Field, errorId } from '../checkout/Field'
import { ProviderMark } from '../ui/ProviderMark'

export type AuthMode = 'login' | 'signup'

type Errors = Partial<Record<'firstName' | 'email' | 'password', string>>

type MessageSignInProps = {
  /** The form's id, for the submit button in the sheet footer. */
  formId: string
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  /** "Sigrún", or "the host". */
  host: string
  /** Known on the booking confirmation. */
  prefill?: { firstName: string; email: string }
}

/**
 * Log in or sign up before writing to a host: a conversation belongs to an
 * account, so it is saved and replies have somewhere to go. There is no auth
 * backend yet, so nothing signs in: the form checks its fields and the sheet
 * stays on this step (the note below turns `ink`), so no message can be sent.
 */
export function MessageSignIn({ formId, mode, onModeChange, host, prefill }: MessageSignInProps) {
  const [firstName, setFirstName] = useState(prefill?.firstName ?? '')
  const [email, setEmail] = useState(prefill?.email ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [tried, setTried] = useState(false)
  const signup = mode === 'signup'

  const check = (values = { firstName, email, password }): Errors => ({
    ...(signup && values.firstName.trim().length < 2 && { firstName: 'Enter your first name' }),
    ...(!isEmail(values.email) && { email: 'Enter an email like name@example.com' }),
    ...(signup
      ? values.password.length < PASSWORD_MIN && { password: `Use at least ${PASSWORD_MIN} characters` }
      : !values.password && { password: 'Enter your password' }),
  })

  // After a failed try, each problem clears as soon as it is fixed
  const recheck = (patch: Partial<{ firstName: string; email: string; password: string }>) => {
    if (Object.keys(errors).length) setErrors(check({ firstName, email, password, ...patch }))
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = check()
    setErrors(found)
    if (Object.keys(found).length) {
      const form = e.currentTarget
      // Skip the hidden panel's copy of a field (it is inert)
      requestAnimationFrame(() =>
        [...form.querySelectorAll<HTMLElement>('[aria-invalid="true"]')].find((el) => !el.closest('[inert]'))?.focus(),
      )
      return
    }
    // No accounts yet: a valid entry goes nowhere, and the sheet stays on this step
    setTried(true)
  }

  // No OAuth yet either
  const continueWith = () => setTried(true)

  const switchMode = (next: AuthMode) => {
    setErrors({})
    onModeChange(next)
  }

  // Each panel has its own inputs (StackedPanels keeps both mounted); the values are shared
  const emailField = (id: string) => (
    <Field id={id} label="Email" error={errors.email}>
      <input
        id={id}
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          recheck({ email: e.target.value })
        }}
        autoComplete="email"
        inputMode="email"
        placeholder="name@example.com"
        aria-invalid={!!errors.email}
        aria-describedby={errorId(id)}
        className={CONTROL}
      />
    </Field>
  )

  const passwordField = (id: string) => (
    <Field
      id={id}
      label="Password"
      error={errors.password}
      trailing={
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          className="shrink-0 font-mono text-label tracking-label text-graphite-600 uppercase transition-colors duration-500 ease-cinematic hover:text-ink focus-visible:text-ink"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      }
    >
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          recheck({ password: e.target.value })
        }}
        autoComplete={signup ? 'new-password' : 'current-password'}
        placeholder={signup ? `At least ${PASSWORD_MIN} characters` : ''}
        aria-invalid={!!errors.password}
        aria-describedby={errorId(id)}
        className={CONTROL}
      />
    </Field>
  )

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-6 pt-6 pb-8">
      <motion.div variants={fadeUp} className="flex flex-col gap-3">
        <h3 className="text-title leading-[1.3] tracking-[-0.02em] text-ink">{typeset(`Log in or sign up to message ${host}`)}</h3>
        <p className="text-body leading-[1.55] text-graphite-600">{typeset(MESSAGE.why(host))}</p>
      </motion.div>

      {/* Google / Apple sign in and sign up alike, so they sit above the switch */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {(['google', 'apple'] as const).map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={continueWith}
              className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-full border border-line px-5 whitespace-nowrap text-body tracking-[-0.01em] text-ink transition-colors duration-500 ease-cinematic hover:border-ink hover:bg-ink hover:text-milk focus-visible:border-ink focus-visible:bg-ink focus-visible:text-milk"
            >
              <ProviderMark provider={provider} />
              Continue with {PROVIDER_LABELS[provider]}
            </button>
          ))}
        </div>
        <div aria-hidden className="flex items-center gap-4 font-mono text-label tracking-label text-graphite-600 uppercase">
          <span className="h-px flex-1 bg-line" />
          or with email
          <span className="h-px flex-1 bg-line" />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        <PillChoice
          label="Log in or sign up"
          layoutId={`${formId}-mode`}
          full
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'login', label: 'Log in' },
            { value: 'signup', label: 'Sign up' },
          ]}
        />
        <StackedPanels
          active={mode}
          panels={{
            login: (
              <div className="flex flex-col gap-4">
                {emailField(`${formId}-login-email`)}
                {passwordField(`${formId}-login-password`)}
              </div>
            ),
            signup: (
              <div className="flex flex-col gap-4">
                <Field id={`${formId}-name`} label="First name" error={errors.firstName}>
                  <input
                    id={`${formId}-name`}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value)
                      recheck({ firstName: e.target.value })
                    }}
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errorId(`${formId}-name`)}
                    className={CONTROL}
                  />
                </Field>
                {emailField(`${formId}-signup-email`)}
                {passwordField(`${formId}-signup-password`)}
              </div>
            ),
          }}
        />
      </motion.div>

      <motion.p variants={fadeUp} aria-live="polite" className={`font-mono text-label ${tried ? 'text-ink' : 'text-graphite-600'}`}>
        {MESSAGE.accountPrototype}
      </motion.p>
    </form>
  )
}
