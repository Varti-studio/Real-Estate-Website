import { Lock } from 'lucide-react'
import { CHECKOUT, EMAIL } from '../../data/copy'
import { Logo } from '../ui/Logo'

/**
 * The checkout's own bar: the logo and the secure-checkout line, nothing to
 * wander off to mid-payment. Static, so nothing pins over the form.
 */
export function CheckoutHeader() {
  return (
    <header className="border-b border-line">
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />
        <p className="flex items-center gap-2 font-mono text-label text-graphite-600">
          <Lock size={14} strokeWidth={1.5} aria-hidden className="text-ink" />
          {CHECKOUT.secure}
          <span className="hidden sm:inline">· {CHECKOUT.guarantee}</span>
        </p>
      </div>
    </header>
  )
}

/** A slim line in place of the host CTA panel. */
export function CheckoutFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-2 py-8 font-mono text-label text-graphite-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Solum Stays</p>
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent('Booking question')}`}
          className="underline-offset-4 transition-colors duration-500 ease-cinematic hover:text-ink hover:underline"
        >
          Questions? {EMAIL}
        </a>
      </div>
    </footer>
  )
}
