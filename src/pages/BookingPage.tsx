import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BOOKED } from '../data/copy'
import { experiences } from '../data/experiences'
import { stays } from '../data/stays'
import { loadBooking, refFromPath, type Booking } from '../lib/booking'
import { splitPlan } from '../lib/checkout'
import { nightsBetween, todayISO } from '../lib/dates'
import { STAGGER, fadeUp, inView, staggerContainer } from '../lib/motion'
import { quote } from '../lib/pricing'
import { linkClick, useLocation } from '../lib/router'
import { storyFor } from '../lib/stay'
import { BookedStayCard } from '../components/booking/BookedStayCard'
import { BookingBar } from '../components/booking/BookingBar'
import { CancellationCard } from '../components/booking/CancellationCard'
import { LocalExperiences } from '../components/booking/LocalExperiences'
import { NextSteps } from '../components/booking/NextSteps'
import { PaymentCard } from '../components/booking/PaymentCard'
import { QuickActions } from '../components/booking/QuickActions'
import { SuccessHero } from '../components/booking/SuccessHero'
import type { Trip } from '../components/booking/trip'
import { MessageHost } from '../components/stay/MessageHost'
import { accent } from '../components/stay/text'
import { Button } from '../components/ui/Button'
import { MonoLabel } from '../components/ui/MonoLabel'

/** /bookings/<ref> — the confirmation after checkout: the trip, what happens next, payment and cancellation. */
export function BookingPage() {
  const { pathname } = useLocation()
  const ref = refFromPath(pathname)
  const booking = useMemo(() => loadBooking(ref), [ref])
  const stay = booking && stays.find((s) => s.id === booking.stayId)
  return booking && stay ? <BookingView key={ref} booking={booking} stayId={stay.id} /> : <BookingNotFound />
}

function BookingView({ booking, stayId }: { booking: Booking; stayId: string }) {
  const trip = useMemo<Trip>(() => {
    const stay = stays.find((s) => s.id === stayId)!
    const story = storyFor(stay)
    const q = quote(stay, story, nightsBetween(booking.checkIn, booking.checkOut))
    return { booking, stay, story, quote: q, split: splitPlan(q.due, booking.checkIn, booking.bookedOn), today: todayISO() }
  }, [booking, stayId])
  const { stay } = trip
  const [messaging, setMessaging] = useState(false)

  // The Trips placeholder: a note above the bar for a few seconds
  const [note, setNote] = useState('')
  const timer = useRef(0)
  const showTrips = () => {
    window.clearTimeout(timer.current)
    setNote(BOOKED.trips)
    timer.current = window.setTimeout(() => setNote(''), 5000)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    document.title = `${stay.instantBook ? 'Booked' : 'Requested'}: ${stay.name} — Solum`
  }, [stay])

  return (
    <main>
      <SuccessHero trip={trip} />

      <motion.div
        variants={staggerContainer(STAGGER.base, 0.6)}
        initial="hidden"
        animate="visible"
        className="container-x flex flex-col gap-4 py-10 lg:gap-6 lg:py-14"
      >
        <motion.div variants={fadeUp}>
          <BookedStayCard trip={trip} onMessage={() => setMessaging(true)} />
        </motion.div>
        <QuickActions trip={trip} onTrips={showTrips} />
      </motion.div>

      <NextSteps trip={trip} />

      <motion.div
        variants={staggerContainer(STAGGER.base)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="container-x grid gap-4 py-16 lg:grid-cols-2 lg:gap-6 lg:py-24"
      >
        <motion.div variants={fadeUp}>
          <PaymentCard trip={trip} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <CancellationCard trip={trip} />
        </motion.div>
      </motion.div>

      <LocalExperiences items={experiences.filter((e) => e.stayId === stay.id)} />

      <BookingBar trip={trip} note={note} onTrips={showTrips} onMessage={() => setMessaging(true)} />

      <MessageHost
        open={messaging}
        onClose={() => setMessaging(false)}
        stay={stay}
        story={trip.story}
        trip={booking}
        reference={booking.ref}
        prefill={booking.guest}
      />
    </main>
  )
}

/** An unknown reference, or a booking made in another tab or browser (they live in session storage). */
function BookingNotFound() {
  useEffect(() => {
    document.title = 'Booking not found — Solum'
  }, [])

  return (
    <main className="container-x pb-24 lg:pb-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10 flex flex-col items-start gap-8 border-b border-line pb-16 lg:mt-16 lg:pb-24"
      >
        <MonoLabel className="text-graphite-600">(—) Booking not found</MonoLabel>
        <p className="max-w-2xl text-h2 font-light">
          We can’t find this {accent('booking')} here. Your confirmation email has the full details.
        </p>
        <Button href="/search" onClick={(e) => linkClick(e, '/search')}>
          Browse all stays
        </Button>
      </motion.div>
    </main>
  )
}
