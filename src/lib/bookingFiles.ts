/**
 * Files a booked guest can save: a calendar event (.ics) and a one-page
 * receipt (.pdf). Both are built here as plain text, with no dependency.
 */

/* ─── Calendar ──────────────────────────────────────────────────────────── */

/** RFC 5545 text: backslash, semicolon, comma and newline escaped. */
const icsText = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')

/** "2026-10-12", "15:00" → "20261012T150000" (floating: the house's local time). */
const icsTime = (iso: string, time: string) => `${iso.replace(/-/g, '')}T${time.replace(':', '')}00`

/** Lines over 75 octets fold onto a continuation line that starts with a space. */
const fold = (line: string) => line.match(/.{1,72}/g)?.join('\r\n ') ?? line

export function calendarFile(event: {
  uid: string
  title: string
  location: string
  description: string
  checkIn: string
  checkOut: string
  /** "15:00" */
  from: string
  /** "11:00" */
  until: string
}) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Solum Stays//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsTime(event.checkIn, event.from)}`,
    `DTEND:${icsTime(event.checkOut, event.until)}`,
    `SUMMARY:${icsText(event.title)}`,
    `LOCATION:${icsText(event.location)}`,
    `DESCRIPTION:${icsText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
}

/* ─── Receipt ───────────────────────────────────────────────────────────── */

/** WinAnsi codes for the characters outside Latin-1 that our copy uses. */
const WIN_ANSI: Record<string, number> = { '€': 0x80, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97 }

/** One byte per character, so string lengths are byte offsets. Unknown characters become "?". */
function toBytes(s: string) {
  return Uint8Array.from(s, (c) => {
    const code = c.charCodeAt(0)
    if (code < 0x80 || (code >= 0xa0 && code <= 0xff)) return code
    return WIN_ANSI[c] ?? 0x3f
  })
}

const pdfText = (s: string) => `(${s.replace(/[\\()]/g, (c) => `\\${c}`)})`

export type Receipt = {
  title: string
  /** Label → value pairs under the title (reference, guest, stay, dates). */
  rows: [string, string][]
  /** The price lines, amount right-aligned. */
  lines: [string, string][]
  total: [string, string]
  footer: string[]
}

/** A one-page A4 receipt: Helvetica for words, Courier for figures (fixed 0.6 em, so they right-align without font metrics). */
export function receiptPdf({ title, rows, lines, total, footer }: Receipt) {
  const left = 60
  const right = 535
  const ops: string[] = []
  let y = 770

  const text = (font: 'F1' | 'F2' | 'F3' | 'F4', size: number, x: number, s: string) =>
    ops.push(`BT /${font} ${size} Tf ${x} ${y} Td ${pdfText(s)} Tj ET`)
  /** Courier is 0.6 em wide per character. */
  const figure = (size: number, s: string, font: 'F3' | 'F4' = 'F3') => text(font, size, right - s.length * size * 0.6, s)
  const rule = () => ops.push(`0.87 0.855 0.816 RG 0.5 w ${left} ${y} m ${right} ${y} l S`)

  ops.push('0.07 0.07 0.067 rg')
  text('F2', 11, left, 'SOLUM STAYS')
  y -= 44
  text('F1', 22, left, title)
  y -= 28
  rule()

  for (const [label, value] of rows) {
    y -= 22
    text('F3', 8, left, label.toUpperCase())
    text('F1', 11, 200, value)
  }

  y -= 30
  rule()
  for (const [label, amount] of lines) {
    y -= 22
    text('F1', 11, left, label)
    figure(11, amount)
  }
  y -= 16
  rule()
  y -= 26
  text('F2', 13, left, total[0])
  figure(13, total[1], 'F4')

  y -= 48
  for (const line of footer) {
    text('F3', 8, left, line)
    y -= 14
  }

  const stream = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]

  let body = '%PDF-1.4\n'
  const offsets = objects.map((object, i) => {
    const offset = body.length
    body += `${i + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  body += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  return toBytes(body)
}

/* ─── Download ──────────────────────────────────────────────────────────── */

export function downloadFile(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
