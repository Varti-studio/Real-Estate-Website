import { MotionConfig } from 'framer-motion'
import { useLocation } from './lib/router'
import { isBookingPath } from './lib/booking'
import { isCheckoutPath } from './lib/stay'
import { Header } from './components/Header'
import { InfoSheet } from './components/InfoSheet'
import { FooterEditorial } from './components/FooterEditorial'
import { BookingHeader } from './components/booking/BookingHeader'
import { CheckoutFooter, CheckoutHeader } from './components/checkout/CheckoutChrome'
import { BookingPage } from './pages/BookingPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { StayPage } from './pages/StayPage'

export default function App() {
  const { pathname } = useLocation()

  // Checkout has its own quiet chrome: nothing to wander off to mid-payment
  if (isCheckoutPath(pathname)) {
    return (
      <MotionConfig reducedMotion="user">
        <CheckoutHeader />
        <CheckoutPage />
        <CheckoutFooter />
        <InfoSheet />
      </MotionConfig>
    )
  }

  // The confirmation keeps the same quiet chrome, with the booking reference in the bar
  if (isBookingPath(pathname)) {
    return (
      <MotionConfig reducedMotion="user">
        <BookingHeader />
        <BookingPage />
        <CheckoutFooter />
        <InfoSheet />
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      {pathname === '/search' ? <SearchPage /> : pathname.startsWith('/stays/') ? <StayPage /> : <HomePage />}
      <FooterEditorial />
      <InfoSheet />
    </MotionConfig>
  )
}
