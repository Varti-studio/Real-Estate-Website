import { useState } from 'react'

type HostAvatarProps = {
  name: string
  photo?: string
  /** Size and type scale, e.g. "size-12 text-title". */
  className?: string
}

/**
 * The host's portrait in a circle, or their initial in Instrument Serif on
 * sand when there is no photo or it fails to load. Decorative: the name is
 * always written next to it.
 */
export function HostAvatar({ name, photo, className = 'size-12 text-title' }: HostAvatarProps) {
  const [failed, setFailed] = useState(false)
  const showPhoto = photo && !failed

  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-sand font-serif leading-none tracking-normal italic ${className}`}
    >
      {showPhoto ? (
        <img src={photo} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0)
      )}
    </span>
  )
}
