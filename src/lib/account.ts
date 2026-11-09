import { useEffect, useState } from 'react'

/**
 * The visitor's Solum account. There is no auth backend yet: logging in or
 * signing up (the message window) keeps the name and email in session
 * storage, so they stay in this tab, and the password is never stored.
 * Messages to hosts belong to an account, so replies have somewhere to go.
 * Google and Apple are simulated the same way: one click signs in.
 */

export type Provider = 'google' | 'apple'

/** Signed in with email (and a password), or through Google or Apple, where the email may be unknown here. */
export type Account = { email: string; firstName?: string; provider?: Provider }

export const PROVIDER_LABELS: Record<Provider, string> = { google: 'Google', apple: 'Apple' }

/** "olena@example.com", or "your Google account" when the provider hasn't told us the email. */
export const accountLabel = (account: Account) =>
  account.email || (account.provider ? `your ${PROVIDER_LABELS[account.provider]} account` : '')

const KEY = 'solum:account'
const EVENT = 'solum:account'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** A plausible address: something@domain.tld. */
export const isEmail = (value: string) => EMAIL.test(value.trim())

/** At least this many characters for a new password. */
export const PASSWORD_MIN = 8

export function loadAccount(): Account | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Account) : null
    return parsed && typeof parsed.email === 'string' ? parsed : null
  } catch {
    return null
  }
}

/** Signs in (or out, with `null`) and tells every `useAccount` on the page. */
export function setAccount(account: Account | null) {
  try {
    if (account) sessionStorage.setItem(KEY, JSON.stringify(account))
    else sessionStorage.removeItem(KEY)
  } catch {
    /* storage blocked: signed in until the page reloads */
  }
  window.dispatchEvent(new CustomEvent<Account | null>(EVENT, { detail: account }))
}

/** The signed-in account, or null; follows `setAccount`. */
export function useAccount() {
  const [account, setState] = useState<Account | null>(loadAccount)
  useEffect(() => {
    const onChange = (e: Event) => setState((e as CustomEvent<Account | null>).detail)
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])
  return account
}
