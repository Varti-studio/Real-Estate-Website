import { motion } from 'framer-motion'
import { BOOKED } from '../../data/copy'
import { addDays, formatShortDate } from '../../lib/dates'
import { STAGGER, fadeUp, inView, staggerContainer } from '../../lib/motion'
import { NBSP, typeset } from '../../lib/typography'
import { accent } from '../stay/text'
import { Tag } from '../ui/Tag'
import { hostName, type Trip } from './trip'

/** Now, two days out, arrival: three dated steps between hairlines, like (04) How it works. */
export function NextSteps({ trip }: { trip: Trip }) {
  const { booking, story } = trip
  const host = hostName(story)
  const capitalised = host.charAt(0).toUpperCase() + host.slice(1)

  const steps = [
    { when: 'Now', title: 'Confirmation email', body: BOOKED.email(booking.guest.email) },
    { when: formatShortDate(addDays(booking.checkIn, -2)), title: 'Check-in details', body: BOOKED.details },
    { when: formatShortDate(booking.checkIn), title: 'Arrival', body: `${story.arrival.steps} ${BOOKED.reachable(capitalised)}` },
  ]

  return (
    <section aria-labelledby="next-title" className="border-y border-line bg-milk print:border-0 print:bg-transparent">
      <div className="container-x py-16 lg:py-24">
        <motion.h2
          id="next-title"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="text-h3 font-light"
        >
          What happens{NBSP}{accent('next')}
        </motion.h2>

        <motion.ol
          variants={staggerContainer(STAGGER.base)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-10 grid lg:mt-14 lg:grid-cols-3 lg:gap-x-20"
        >
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              variants={fadeUp}
              // As in HowItWorks: from lg the divider sits in the middle of the gap, so the columns keep one width
              className={`border-t border-line py-8 md:grid md:grid-cols-12 md:gap-x-6 lg:block lg:border-t-0 lg:py-0 ${
                i > 0 ? 'lg:-ml-10 lg:border-l lg:pl-10' : ''
              }`}
            >
              <div className="md:col-span-4">
                <Tag className={i === 0 ? 'border-ink bg-ink text-milk' : ''}>{step.when}</Tag>
              </div>
              <div className="mt-6 md:col-span-8 md:mt-0 lg:mt-10">
                <h3 className="text-title tracking-[-0.02em] text-ink">{step.title}</h3>
                <p className="mt-3 max-w-[40ch] text-body leading-[1.55] text-graphite-600">{typeset(step.body)}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
