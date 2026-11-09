import { useState, type ImgHTMLAttributes } from 'react'

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & {
  alt: string
  wrapperClassName?: string
}

/**
 * Photo with a tone-on-tone placeholder behind it. The sand + grain block
 * shows while loading and stays if the image fails.
 */
export function ImageWithFallback({
  wrapperClassName = '',
  className = '',
  alt,
  onError,
  ...rest
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-sand ${wrapperClassName}`}>
      <div aria-hidden className="grain absolute inset-0 opacity-60" />
      {!failed && (
        <img
          alt={alt}
          decoding="async"
          className={`relative h-full w-full object-cover ${className}`}
          onError={(e) => {
            setFailed(true)
            onError?.(e)
          }}
          {...rest}
        />
      )}
    </div>
  )
}
