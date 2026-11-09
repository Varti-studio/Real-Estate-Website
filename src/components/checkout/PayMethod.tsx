import { AnimatePresence, motion } from 'framer-motion'
import { CreditCard, Smartphone, Wallet } from 'lucide-react'
import {
  CARD_LABELS,
  cvvLengths,
  detectCard,
  formatCardNumber,
  formatExpiry,
  type CheckoutForm,
  type FieldName,
  type PayMethod as Method,
} from '../../lib/checkout'
import { DURATION, transition } from '../../lib/motion'
import { PillChoice } from './Choice'
import { CONTROL, Checkbox, Field, SelectChevron, errorId, reformat } from './Field'

const COUNTRIES = ['Norway', 'Sweden', 'Denmark', 'Finland', 'Germany', 'Netherlands', 'Switzerland', 'United Kingdom', 'Ukraine', 'United States']

/** What happens after Confirm for the methods that leave the page. */
const ELSEWHERE: Record<Exclude<Method, 'card'>, string> = {
  paypal: 'After you confirm, PayPal opens to finish the payment. You come back here when it’s done.',
  applepay: 'After you confirm, Apple Pay asks you to approve the payment on your device.',
  klarna: 'After you confirm, Klarna opens to set up your payments. Its own terms apply.',
}

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const

type PayMethodProps = {
  method: Method
  onMethodChange: (method: Method) => void
  form: CheckoutForm
  errors: Partial<Record<FieldName, string>>
  onChange: <K extends keyof CheckoutForm>(name: K, value: CheckoutForm[K]) => void
  onBlur: (name: FieldName) => void
}

/** "Pay with": the method pills, then the card form or a line on where the payment finishes. */
export function PayMethod({ method, onMethodChange, form, errors, onChange, onBlur }: PayMethodProps) {
  return (
    <div className="flex flex-col gap-6">
      <PillChoice
        label="Payment method"
        layoutId="checkout-method"
        value={method}
        onChange={onMethodChange}
        options={[
          { value: 'card', label: 'Credit or debit card', icon: <CreditCard {...ICON} /> },
          { value: 'paypal', label: 'PayPal', icon: <Wallet {...ICON} /> },
          { value: 'applepay', label: 'Apple Pay', icon: <Smartphone {...ICON} /> },
          { value: 'klarna', label: 'Klarna', icon: <Wallet {...ICON} /> },
        ]}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={method}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: transition(DURATION.micro * 0.6) }}
          transition={transition(DURATION.ui)}
        >
          {method === 'card' ? (
            <CardFields form={form} errors={errors} onChange={onChange} onBlur={onBlur} />
          ) : (
            <p className="rounded-card bg-sand p-5 text-body leading-[1.55] text-graphite-600">{ELSEWHERE[method]}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CardFields({ form, errors, onChange, onBlur }: Omit<PayMethodProps, 'method' | 'onMethodChange'>) {
  const brand = detectCard(form.cardNumber)
  const input = (name: 'cardNumber' | 'expiry' | 'cvv' | 'postal') => ({
    id: `checkout-${name}`,
    className: CONTROL,
    value: form[name],
    onBlur: () => onBlur(name),
    'aria-invalid': !!errors[name],
    'aria-describedby': errorId(`checkout-${name}`),
  })

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Field
        id="checkout-cardNumber"
        label="Card number"
        error={errors.cardNumber}
        className="col-span-2 md:col-span-3"
        trailing={
          <span className="relative inline-grid min-w-20 justify-items-end" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={brand ?? 'none'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transition(DURATION.micro)}
                className="font-mono text-label tracking-label text-graphite-600 uppercase"
              >
                {brand ? CARD_LABELS[brand] : <CreditCard size={18} strokeWidth={1.5} aria-hidden className="text-stone-500" />}
              </motion.span>
            </AnimatePresence>
          </span>
        }
      >
        <input
          {...input('cardNumber')}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          onChange={(e) => onChange('cardNumber', reformat(e.target, formatCardNumber))}
        />
      </Field>
      <Field id="checkout-expiry" label="Expiry" error={errors.expiry}>
        <input
          {...input('expiry')}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM / YY"
          onChange={(e) => onChange('expiry', reformat(e.target, formatExpiry))}
        />
      </Field>
      <Field id="checkout-cvv" label="CVV" error={errors.cvv}>
        <input
          {...input('cvv')}
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder={'•'.repeat(Math.min(...cvvLengths(brand)))}
          onChange={(e) => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, Math.max(...cvvLengths(brand))))}
        />
      </Field>
      <Field id="checkout-postal" label="Postal code" error={errors.postal} className="col-span-2 md:col-span-1">
        <input {...input('postal')} autoComplete="postal-code" placeholder="5745" onChange={(e) => onChange('postal', e.target.value.slice(0, 10))} />
      </Field>
      <Field id="checkout-country" label="Country / region" className="col-span-2 md:col-span-3" trailing={<SelectChevron />}>
        <select
          id="checkout-country"
          autoComplete="country-name"
          value={form.country}
          onChange={(e) => onChange('country', e.target.value)}
          className={`${CONTROL} cursor-pointer`}
        >
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <div className="col-span-2 pt-2 md:col-span-3">
        <Checkbox id="checkout-save" checked={form.saveCard} onChange={(v) => onChange('saveCard', v)}>
          Save this payment method for future stays
        </Checkbox>
      </div>
    </div>
  )
}
