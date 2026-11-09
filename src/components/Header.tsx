import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Logo } from './ui/Logo'
import { DURATION, STAGGER, fadeUp, staggerContainer, transition } from '../lib/motion'
import { goTo, useLocation } from '../lib/router'

const NAV = ['Stays', 'Collections', 'How it works', 'About'] as const
type NavItem = (typeof NAV)[number]

/** Stays has a page; the others are home sections (About is Trust & standards until it has a page). */
const ROUTES: Record<NavItem, string> = {
  Stays: '/search',
  Collections: '/#collections',
  'How it works': '/#how-it-works',
  About: '/#trust',
}

const go = (item: NavItem) => goTo(ROUTES[item])

/** The host CTA at the foot of every page. */
const HOST_HREF = '/#list-your-home'
/** No accounts yet — placeholders until auth exists. */
const LOGIN_HREF = '#'
const SIGNUP_HREF = '#'

/** "List your home" and "Log in": plain ink text with an underline that grows on hover or focus. */
const TEXT_LINK = 'group relative text-body whitespace-nowrap text-ink'
const UNDERLINE =
  'absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-cinematic group-hover:scale-x-100 group-focus-visible:scale-x-100'

export function Header() {
  const { pathname } = useLocation()
  const active = (Object.keys(ROUTES) as NavItem[]).find((k) => ROUTES[k] === pathname) ?? null
  const [open, setOpen] = useState(false)
  // Reading progress along the header's foot: the page's scroll share, as a scaleX (transform only)
  const { scrollYProgress } = useScroll()
  // Pinned: transparent at the very top, a frosted paper bar with a hairline once content scrolls under it
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(DURATION.reveal)}
      className="sticky top-0 z-40"
    >
      {/* Background on its own layer: a backdrop-filter on the header itself would
          become the containing block of the fixed mobile menu inside it */}
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 border-b bg-paper/85 backdrop-blur-md transition-[opacity,border-color] duration-500 ease-cinematic ${
          scrolled ? 'border-line opacity-100' : 'border-transparent opacity-0'
        }`}
      />
      <div className="container-x flex h-20 items-center justify-between gap-6 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Logo />

        {/* Desktop nav — a dark glass capsule, centred on the page */}
        <nav
          aria-label="Primary"
          className="hidden items-center rounded-full border border-milk/12 bg-ink/84 p-1 shadow-glass backdrop-blur-[18px] backdrop-saturate-[1.3] md:flex"
        >
          {NAV.map((item) => (
            <a
              key={item}
              href={ROUTES[item]}
              onClick={(e) => {
                e.preventDefault()
                go(item)
              }}
              aria-current={active === item ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-body tracking-[-0.01em] whitespace-nowrap transition-colors duration-300 hover:text-milk focus-visible:text-milk ${
                active === item ? 'bg-milk/15 text-milk' : 'text-milk/78'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2 whitespace-nowrap">
          <a
            href={HOST_HREF}
            onClick={(e) => {
              e.preventDefault()
              goTo(HOST_HREF)
            }}
            className={`${TEXT_LINK} mr-4 hidden lg:inline-block`}
          >
            List your home
            <span className={UNDERLINE} />
          </a>
          <a href={LOGIN_HREF} className={`${TEXT_LINK} mr-4 hidden lg:inline-block`}>
            Log in
            <span className={UNDERLINE} />
          </a>
          <div className="hidden sm:block">
            <Button variant="outline" icon={false} href={SIGNUP_HREF}>
              Sign up
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors duration-500 ease-cinematic hover:bg-ink hover:text-milk md:hidden"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={transition(DURATION.ui)}
            className="fixed inset-0 z-50 flex flex-col bg-ink text-milk md:hidden"
          >
            <div className="container-x flex h-20 items-center justify-between">
              <Logo light onClick={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-milk/20"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <motion.nav
              aria-label="Mobile"
              variants={staggerContainer(STAGGER.tight, 0.2)}
              initial="hidden"
              animate="visible"
              className="container-x mt-10 flex flex-col"
            >
              {NAV.map((item, i) => (
                <motion.a
                  key={item}
                  variants={fadeUp}
                  href={ROUTES[item]}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item)
                    setOpen(false)
                  }}
                  className="flex items-baseline justify-between border-b border-milk/10 py-5 text-quote font-light tracking-[-0.04em]"
                >
                  {item}
                  <span className="font-mono text-label tracking-label text-milk/40">
                    (0{i + 1})
                  </span>
                </motion.a>
              ))}
            </motion.nav>

            <div className="container-x mt-auto flex flex-col gap-6 pb-10">
              <a
                href={HOST_HREF}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  goTo(HOST_HREF)
                }}
                className="font-mono text-label tracking-label text-milk/70 uppercase transition-colors duration-500 ease-cinematic hover:text-milk"
              >
                List your home ↗
              </a>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href={LOGIN_HREF} variant="ghost-light" icon={false} className="w-full sm:w-auto">
                  Log in
                </Button>
                <Button href={SIGNUP_HREF} variant="light" icon={false} className="w-full sm:w-auto">
                  Sign up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
