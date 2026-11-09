import { useLocation } from '../../lib/router'
import { loadBooking, refFromPath } from '../../lib/booking'
import { Logo } from '../ui/Logo'
import { CopyButton } from './CopyButton'

/**
 * The confirmation page's bar: the logo and the booking reference, which
 * copies on click. Static, like the checkout's, so nothing pins over the page.
 */
export function BookingHeader() {
  const { pathname } = useLocation()
  const ref = refFromPath(pathname)
  const found = !!loadBooking(ref)

  return (
    <header className="border-b border-line">
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />
        {found && (
          <CopyButton
            text={ref}
            label={`Copy booking reference ${ref}`}
            tooltip="below"
            className="group flex items-center gap-2 rounded-full font-mono text-label text-graphite-600 tabular-nums transition-colors duration-500 ease-cinematic hover:text-ink focus-visible:text-ink"
          >
            {() => (
              <>
                <span className="hidden sm:inline">Booking reference</span>
                <span className="text-ink underline-offset-4 group-hover:underline group-focus-visible:underline">{ref}</span>
              </>
            )}
          </CopyButton>
        )}
      </div>
    </header>
  )
}
