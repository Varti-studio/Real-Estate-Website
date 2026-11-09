import type { CheckoutForm, FieldName } from '../../lib/checkout'
import { CONTROL, Field, SelectChevron, errorId } from './Field'

const CODES = [
  { code: '+47', country: 'Norway' },
  { code: '+46', country: 'Sweden' },
  { code: '+45', country: 'Denmark' },
  { code: '+358', country: 'Finland' },
  { code: '+49', country: 'Germany' },
  { code: '+31', country: 'Netherlands' },
  { code: '+41', country: 'Switzerland' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+380', country: 'Ukraine' },
  { code: '+33', country: 'France' },
  { code: '+1', country: 'United States' },
]

type TripRequirementsProps = {
  host: string
  form: CheckoutForm
  errors: Partial<Record<FieldName, string>>
  onChange: <K extends keyof CheckoutForm>(name: K, value: CheckoutForm[K]) => void
  onBlur: (name: FieldName) => void
}

/** "Required for your trip": a message for the host and a phone for the door code. */
export function TripRequirements({ host, form, errors, onChange, onBlur }: TripRequirementsProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-body tracking-[-0.01em]">Message the host</span>
          <span id="checkout-message-hint" className="text-body text-graphite-600">
            {host} wants to know who is coming and why.
          </span>
        </div>
        <Field id="checkout-message" label={`To ${host}`} error={errors.message}>
          <textarea
            id="checkout-message"
            rows={4}
            value={form.message}
            onChange={(e) => onChange('message', e.target.value)}
            onBlur={() => onBlur('message')}
            aria-invalid={!!errors.message}
            aria-describedby={`${errorId('checkout-message')} checkout-message-hint`}
            placeholder={`Hi ${host} — two of us, coming for the autumn colours and a few days off-grid. Arriving by train around 14:00.`}
            className={`${CONTROL} resize-none leading-[1.55]`}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        {/* "Code", not "Country code": the long label wrapped in the narrow box on phones */}
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 md:grid-cols-[9rem_minmax(0,1fr)]">
          <Field id="checkout-phoneCode" label="Code" trailing={<SelectChevron />}>
            <select
              id="checkout-phoneCode"
              aria-label="Country code"
              autoComplete="tel-country-code"
              value={form.phoneCode}
              onChange={(e) => onChange('phoneCode', e.target.value)}
              className={`${CONTROL} cursor-pointer`}
            >
              {CODES.map(({ code, country }) => (
                <option key={code} value={code} aria-label={`${country} ${code}`}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
          <Field id="checkout-phone" label="Phone number" error={errors.phone}>
            <input
              id="checkout-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value.replace(/[^\d\s-]/g, '').slice(0, 18))}
              onBlur={() => onBlur('phone')}
              aria-invalid={!!errors.phone}
              aria-describedby={`${errorId('checkout-phone')} checkout-phone-hint`}
              placeholder="412 34 567"
              className={CONTROL}
            />
          </Field>
        </div>
        <p id="checkout-phone-hint" className="font-mono text-label text-graphite-600">
          We text you the door code and directions. Standard message rates apply.
        </p>
      </div>
    </div>
  )
}
