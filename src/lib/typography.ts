/** Non-breaking space. */
export const NBSP = ' '

/**
 * Non-breaking spaces where a line break reads badly: between a number and
 * what it counts ("64 m²", "4 nights"), around the " / " of a price unit,
 * before an em dash, and between the last two words, so no line ends on a
 * single word. A fallback for browsers without `text-wrap: balance | pretty`.
 */
export function typeset(text: string) {
  return text
    .replace(/(\d) (?=[^\s\d])/g, `$1${NBSP}`)
    .replace(/ \/ /g, `${NBSP}/${NBSP}`)
    .replace(/ —/g, `${NBSP}—`)
    .replace(/ (\S+)$/, `${NBSP}$1`)
}
