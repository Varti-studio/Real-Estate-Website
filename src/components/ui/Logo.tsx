import { Link } from '../../lib/router'

type LogoProps = {
  light?: boolean
  onClick?: () => void
}

/**
 * The SOLUM wordmark: Geist Light, 20px, tracked +0.5em. The negative end
 * margin takes the tracking back off the last letter, so the word's right edge
 * is the "M" itself. Links home.
 */
export function Logo({ light = false, onClick }: LogoProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Solum — home"
      className={`flex w-fit items-center whitespace-nowrap ${light ? 'text-milk' : 'text-ink'}`}
    >
      <span
        className="font-sans font-light"
        style={{ fontSize: 20, lineHeight: 1, letterSpacing: '0.5em', marginRight: '-0.5em' }}
      >
        SOLUM
      </span>
    </Link>
  )
}
