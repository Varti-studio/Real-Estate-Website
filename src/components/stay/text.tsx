import { Fragment } from 'react'
import { typeset } from '../../lib/typography'

/** The one serif-italic accent of a heading or quote. */
export const accent = (word: string) => (
  <span className="accent">{word}</span>
)

/** Renders `*word*` segments as serif-italic accents, typeset so no line ends on one word. */
export function Accented({ text }: { text: string }) {
  return (
    <>
      {typeset(text)
        .split(/\*(.+?)\*/)
        .map((part, i) => (i % 2 ? <Fragment key={i}>{accent(part)}</Fragment> : part))}
    </>
  )
}
