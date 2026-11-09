import { ADDRESS_NOTE, CANCELLATION } from './copy'
import { stays } from './stays'

/** A practical question answered in (07) FAQ. */
export interface FaqItem {
  question: string
  answer: string
}

const petFriendly = stays.filter((s) => s.petFriendly).length

/**
 * Questions in accordion order. Check-in is described once on the home page,
 * in (04) How it works, so it has no question here.
 */
export const faq: FaqItem[] = [
  {
    question: 'How private are the homes?',
    answer:
      'Most homes have no neighbours in sight, and each listing maps the private land around the house. City lofts are marked as such.',
  },
  {
    question: 'How do we reach the remote homes?',
    answer: `${ADDRESS_NOTE} Each listing explains the last stretch, whether that is a footpath, a fixed cable or a rowing boat, and we can arrange a transfer from the nearest station.`,
  },
  {
    question: 'What does every home have?',
    answer:
      'Bed linen, a kitchen, a pour-over coffee kit, heating and a first aid kit. Saunas, hot tubs and pools vary by home, and not every home has Wi-Fi. Each listing shows the full list.',
  },
  {
    question: 'Can I bring a pet?',
    answer: `Yes, in ${petFriendly} of our ${stays.length} homes. Turn on Pet-friendly under Guests to see them; every listing’s house rules say whether pets are allowed.`,
  },
  {
    question: 'What is the cancellation policy?',
    answer: `${CANCELLATION.summary} The same policy applies to every home.`,
  },
]
