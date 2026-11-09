/**
 * Facts the site states in more than one place: check-in, the address,
 * prices, confirmation, pets and cancellation. Edit them here so the home
 * page, the catalogue, the stay pages and the FAQ never disagree.
 *
 * Roles: the Solum team speaks as "we" (we inspect the homes and answer
 * guests), the architect or studio designed the house, and the host owns it.
 */

/** Our inbox: the footer, checkout, the stay pages and the booking confirmation. */
export const EMAIL = 'hello@solum-stays.com'

/** What Solum is, in one line: the hero. */
export const INTRO = 'Architect-designed homes in Europe and beyond. We check each one in person.'

/** Self check-in with a door code; the host is on the phone. */
export const CHECK_IN = {
  title: 'Self check-in',
  body: (host: string) => `A door code arrives with the address 48 hours before check-in. ${host} answers the phone if you need anything.`,
  /** One line, for the checkout's trip summary. */
  short: 'After 15:00 · door code sent 48 hours before',
  /** The last stretch, for a stay without its own arrival note (booking confirmation). */
  arrival: 'Follow the directions to the door and let yourself in with the code, any time after 15:00.',
}

/** When the exact location is shared. */
export const ADDRESS_NOTE = 'The exact address and directions arrive 48 hours before check-in.'

export const PRICE = {
  /** After a nightly price. */
  unit: 'per night, before taxes',
  summary: 'Prices are per night, before taxes. Cleaning is a separate line, and there is no Solum service fee.',
  serviceFee: 'Solum service fee',
  cleaningFee: 'Cleaning fee',
  taxes: 'Taxes',
}

/** Instant book confirms on the spot; every other home is a request to the host. */
export const CONFIRMATION = {
  instant: { title: 'Instant confirmation', body: 'Your dates are confirmed as soon as you book.' },
  request: {
    title: 'Request to book',
    body: (host: string) => `${host} confirms your dates, usually within a day. You pay once they accept.`,
  },
}

export const OFF_GRID = {
  title: 'Off-grid',
  body: 'Runs on its own power and water, not on the mains.',
}

export const PETS = {
  yes: { title: 'Pets welcome', body: 'Pets can stay. Add yours in the guest picker when you book.' },
  no: { title: 'No pets', body: 'Pets are not allowed in this home.' },
  rule: (allowed: boolean) => (allowed ? 'Pets allowed' : 'No pets'),
}

export const HOUSE_TIMES = ['Check-in after 15:00', 'Checkout before 11:00']

/** The one cancellation policy, as stay-page bullet points and as a sentence. */
export const CANCELLATION = {
  rules: ['Free cancellation for 48 hours after booking', '50% refund up to 7 days before check-in', 'No refund in the final 7 days'],
  summary:
    'You can cancel for free within 48 hours of booking. After that, you get 50% back up to 7 days before check-in, and nothing in the final 7 days.',
}

/** The one badge a stay can earn, with what it means. */
export const GUEST_FAVOURITE = {
  minRating: 9.8,
  label: 'Guest favourite',
  hint: 'Rated 9.8 or higher by guests',
}

/** The checkout page: its badge, the ground rules every guest agrees to, and the agreement line. */
export const CHECKOUT = {
  secure: 'Secure checkout',
  guarantee: 'Every home checked in person',
  groundRules: [
    'Leave the land as you found it: stay on the paths and take your rubbish with you.',
    'No music outdoors after 22:00, for the neighbours and the wildlife.',
    'Treat the house as the architect left it: built-in furniture stays put, and no candles near timber.',
  ],
  agreement: (host: string) =>
    `By confirming, you agree to ${host}’s house rules, the ground rules above and the cancellation policy, and to pay the amount shown.`,
  /** There is no payment backend yet. */
  prototype: 'Prototype: no payment was taken and nothing was sent.',
}

/** The booking confirmation page: what happens next, and the placeholders until accounts exist. */
export const BOOKED = {
  email: (email: string) => `Your receipt and this reference are in ${email}. Keep the reference for any question.`,
  details: `The door code, the exact address and the directions arrive by email and text 48 hours before check-in.`,
  reachable: (host: string) => `${host} answers the phone the whole way.`,
  trips: 'Trips open with accounts. Until then, keep your reference: we can find any booking by it.',
}

/** The message window to a host (stay page and booking confirmation). There is no messaging backend yet. */
export const MESSAGE = {
  /** Quick questions: the chip label, and the line it adds to the message. */
  starters: [
    { label: 'Is it pet-friendly?', text: 'Is the house pet-friendly?' },
    { label: 'Early check-in?', text: 'Could we check in before 15:00?' },
    { label: 'Parking?', text: 'Is there parking at the house?' },
  ],
  maxLength: 1000,
  /** The opening line, filled in from the dates and guests already picked. */
  greeting: (host: string, trip: string, reference?: string) =>
    reference ? `Hi ${host}, about my booking ${reference} (${trip}).` : `Hi ${host}, we would like to stay ${trip}.`,
  /** Why the message window asks for an account first. */
  why: (host: string) => `Your conversation with ${host} is saved to your account, and replies arrive there and by email.`,
  /** Where a reply goes, after Send. */
  /** `to`: an email, or "your Google account". */
  replies: (to: string) =>
    to.includes('@') ? `The reply arrives in your account and by email to ${to}.` : `The reply arrives in your Solum account and at the email on ${to}.`,
  accountPrototype: 'Prototype: accounts are not live yet, so nobody can log in or send a message for now.',
  prototype: 'Prototype: the message was not sent.',
}
