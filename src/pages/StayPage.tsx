import { useEffect, useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { Stay } from '../data/stays'
import { formatRange } from '../lib/dates'
import { DEFAULT_FILTERS, filtersToSearch } from '../lib/filters'
import { STAGGER, fadeUp, staggerContainer } from '../lib/motion'
import { NBSP, typeset } from '../lib/typography'
import { navigate, useLocation } from '../lib/router'
import { checkoutUrl, stayFromPath, stayUrl, storyFor } from '../lib/stay'
import { useMediaQuery } from '../lib/useMediaQuery'
import { Button } from '../components/ui/Button'
import { MonoLabel } from '../components/ui/MonoLabel'
import { DateRangeCalendar } from '../components/search/DateRangeCalendar'
import { AmenityGrid } from '../components/stay/AmenityGrid'
import { BookingWidget, ReserveBar, bookingState } from '../components/stay/BookingWidget'
import { Ratings } from '../components/stay/Ratings'
import { StayGallery } from '../components/stay/StayGallery'
import { StayHeader } from '../components/stay/StayHeader'
import { StayLocation } from '../components/stay/StayLocation'
import { StaySection } from '../components/stay/StaySection'
import { AboutSpace, HostSummary, KeyStandards, SleepCards, ThingsToKnow } from '../components/stay/StoryBlocks'
import { accent } from '../components/stay/text'
import { useStayBooking } from '../components/stay/useStayBooking'

/** /stays/<id> — one stay, its story, and the booking panel. */
export function StayPage() {
  const { pathname } = useLocation()
  const stay = stayFromPath(pathname)
  // Keyed, so moving between stays starts from fresh dates and sheets
  return stay ? <StayView key={stay.id} stay={stay} /> : <StayNotFound />
}

function StayView({ stay }: { stay: Stay }) {
  const story = useMemo(() => storyFor(stay), [stay])
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const reduced = useReducedMotion()

  const { range, guests, selecting, setSelecting, onPickDate, onClearDates, onGuestsChange, nights, isUnavailable, legend } =
    useStayBooking(stay, story, stayUrl)

  useEffect(() => {
    document.title = `${stay.name} — Solum`
  }, [stay.name])

  const backTo = `/search${filtersToSearch({ ...DEFAULT_FILTERS, ...range, ...guests })}`

  // Below lg the panel sits in the flow, and a bar stands in for it while it's out of view
  const inline = useRef<HTMLDivElement>(null)
  const inlineInView = useInView(inline)
  const scrollToPanel = () => inline.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
  // A bookable range goes straight to checkout; otherwise the panel shows what's missing
  const onReserve = () =>
    bookingState(stay, story, range).status === 'ok' ? navigate(checkoutUrl(stay.id, { ...range, ...guests })) : scrollToPanel()

  const widget = (
    <BookingWidget
      stay={stay}
      story={story}
      range={range}
      guests={guests}
      selecting={selecting}
      onSelectingChange={setSelecting}
      onPickDate={onPickDate}
      onClearDates={onClearDates}
      onGuestsChange={onGuestsChange}
      isUnavailable={isUnavailable}
      legend={legend}
    />
  )

  return (
    <main className="container-x pb-24 lg:pb-40">
      <StayHeader stay={stay} story={story} backTo={backTo} />
      <StayGallery photos={story.photos} name={stay.name} />

      <div className="mt-12 grid gap-x-10 lg:mt-16 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <HostSummary stay={stay} story={story} />
          <KeyStandards story={story} />
          <AboutSpace story={story} />
          <AmenityGrid story={story} />
          <SleepCards story={story} />

          <StaySection
            id="availability"
            index="(04)"
            title={<>Availability in {accent(stay.location)}</>}
            meta={
              nights
                ? typeset(`${formatRange(range.checkIn, range.checkOut)} · ${nights} ${nights === 1 ? 'night' : 'nights'} · Minimum stay ${story.minNights} nights`)
                : typeset(`Pick a check-in date · Minimum stay ${story.minNights} nights`)
            }
          >
            <div className="rounded-frame border border-line bg-milk p-5 sm:p-8">
              <DateRangeCalendar
                checkIn={range.checkIn}
                checkOut={range.checkOut}
                selecting={selecting}
                onPick={onPickDate}
                onClear={onClearDates}
                months={isMd ? 2 : 1}
                isUnavailable={isUnavailable}
                legend={legend}
              />
            </div>
          </StaySection>

          <Ratings stay={stay} story={story} />
          <StayLocation stay={stay} story={story} />
          <ThingsToKnow story={story} />

          {/* Below lg the panel closes the story; until then the ReserveBar stands in for it */}
          {!isDesktop && (
            <div id="reserve" ref={inline} className="scroll-mt-6 border-t border-line py-12">
              {widget}
            </div>
          )}
        </div>

        {isDesktop && (
          <aside aria-label="Book this stay" className="lg:col-span-4">
            {/* Enters just after the gallery */}
            <motion.div
              variants={staggerContainer(STAGGER.base, 0.4)}
              initial="hidden"
              animate="visible"
              className="sticky top-[calc(var(--header-h)+2rem)] border-t border-line pt-8"
            >
              <motion.div variants={fadeUp}>{widget}</motion.div>
            </motion.div>
          </aside>
        )}
      </div>

      {!isDesktop && <ReserveBar stay={stay} story={story} range={range} hidden={inlineInView} onReserve={onReserve} />}
    </main>
  )
}

function StayNotFound() {
  useEffect(() => {
    document.title = 'Stay not found — Solum'
  }, [])

  return (
    <main className="container-x pb-24 lg:pb-40">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10 flex flex-col items-start gap-8 border-y border-line py-16 lg:mt-16 lg:py-24"
      >
        <MonoLabel className="text-graphite-600">(—) Stay not found</MonoLabel>
        <p className="max-w-2xl text-h2 font-light">
          We can’t find this {accent('stay')}. It may have left the{NBSP}catalogue.
        </p>
        <Button href="/search" onClick={(e) => { e.preventDefault(); navigate('/search') }}>
          Browse all stays
        </Button>
      </motion.div>
    </main>
  )
}
