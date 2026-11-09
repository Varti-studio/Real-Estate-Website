# SOLUM — Architectural Stays

Premium platform for renting architecturally significant accommodation: geodesic domes, mirror houses in the forest, cliffside capsules, designer villas. The brand is about **slow living, seclusion, and visual immersion in architecture and nature**. Every screen should read like a spread in a high-end architecture publication.

> "SOLUM" is a placeholder brand name (Latin: *ground, soil*). Rename it in `ui/Logo.tsx`, `index.html`, `FooterEditorial.tsx` (copyright), and here.

---

## Commands

This project needs **Node 22** (see `.nvmrc`). Node 22 lives in `%APPDATA%\nvm\v22.23.2` but is not the active nvm version. Either run `nvm use 22` once from an elevated terminal, or prepend it to PATH for the session:

```powershell
$env:Path = "$env:APPDATA\nvm\v22.23.2;" + $env:Path
```

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Vite dev server on http://localhost:5173 |
| `npm run build`     | `tsc -b` type check + production build |
| `npm run typecheck` | Type check only                       |
| `npm run preview`   | Serve the production build            |

The preview launch config launches the dev server with the absolute Node 22 path, so the in-app preview works without PATH changes.

## Stack

- **Vite 8 + React 19 + TypeScript 7** (strict)
- **Tailwind CSS v4**: CSS-first config. All tokens are in `@theme` inside `src/index.css`. There is **no** `tailwind.config.js`.
- **Framer Motion 13**: all motion. Constants and variants live in `src/lib/motion.ts`.
- **Lucide React**: icons. Use `strokeWidth={1.5}` by default (1.25 for icons ≥ 24px) so they match the hairline aesthetic.
- **MapLibre GL 6**: the `/search` map, lazy-loaded (its own chunk). Basemap tiles come from **OpenFreeMap** (no API key; the OSM attribution must stay visible). Its worker is bundled by Vite (`?worker&url` + `setWorkerUrl`, `worker.format: 'es'` in `vite.config.ts`), because MapLibre otherwise resolves it next to its own module, which bundling breaks.
- **Fonts** are self-hosted through Fontsource (no Google CDN): Geist Variable, Geist Mono Variable, Instrument Serif.

## Folder structure

```
src/
  main.tsx            entry
  App.tsx             MotionConfig + Header + route switch
  pages/              HomePage (/), SearchPage (/search), StayPage (/stays/:id),
                      CheckoutPage (/stays/:id/checkout), BookingPage (/bookings/:ref)
  index.css           Tailwind import, @theme tokens, base layer, utilities
  lib/motion.ts       EASE, DURATION, STAGGER, shared variants
  lib/format.ts       pad() ("04", decorative indices only), the EUR priceFormat, roughCoordinates()
  lib/typography.ts   typeset(): non-breaking spaces so no line ends on one word; NBSP
  lib/useMediaQuery.ts live matchMedia hook
  lib/filters.ts      Filters model, matching, chips, destinations, recent searches, URL params
  lib/catalog.ts      /search view state: sort, pagination, coordinates → [lng, lat], map bounds, searchUrl()
  lib/focusTrap.ts    trapFocus() for modal sheets (MobileSearch, ui/Sheet)
  lib/stay.ts         stayUrl(), stayFromPath(), storyFor() (a stay's page content, with generated fallbacks)
  lib/availability.ts booked nights, maxCheckOut(), unavailableDay() for the calendar
  lib/reviews.ts     reviewsFor(): a stay's full review list (written first, then seeded mock reviews from its facts)
  lib/pricing.ts      quote(): the booking breakdown (nights, cleaning)
  lib/checkout.ts     cancellation timeline + cancellationStatus(), split payment, card formatting, form validation
  lib/account.ts      prototype account (session storage, no password kept): useAccount, setAccount, isEmail
  lib/booking.ts      Booking model, newReference() ("HXQ-4821"), bookingUrl(), sessionStorage save/load
  lib/bookingFiles.ts calendarFile() (.ics), receiptPdf() (hand-built one-page PDF), downloadFile()
  lib/useScrollRow.ts scroll-snap row state (arrows, progress), page by one item, reveal on focus
  lib/dates.ts        UTC ISO-date helpers + calendar grid
  lib/router.tsx      tiny History-API router: useLocation, navigate, goTo (page or "/#section"), Link, useInfoSheet
  data/stays.ts       typed mock data (Stay)
  data/stayStories.ts rich stay-page content (StayStory) by stay id; optional per field
  data/collections.ts curated collections (id, title, description), in switcher order
  data/featured.ts    (02) featured picks: stay ids in row order
  data/reflections.ts (06) guest reviews (Reflection), in card order
  data/faq.ts         (07) questions and answers (FaqItem), in accordion order
  data/copy.ts        facts stated in several places: our EMAIL, check-in, address, prices, confirmation, pets, cancellation, badge, MESSAGE (the host message window)
  data/bookings.ts    demo bookings (HXQ-4821), so a confirmation renders without a backend
  data/experiences.ts things to do near each stay ("While you are there"), four per stay via near()
  components/
    ui/               primitives: Button, Tag, MonoLabel, ImageWithFallback, Logo, QuoteCard (one guest review),
                      RowControls (prev/next + progress line under a scroll row),
                      Sheet (portalled modal sheet: side or full screen)
    featured/         FeaturedStays (section: scroll-snap row + catalogue card)
    search/           SearchBar (entry), DesktopSearchBar, MobileSearch, Popover,
                      DestinationPanel, DateRangeCalendar, GuestsPanel,
                      useDestinationCombobox, useRecentSearches
    collections/      CuratedCollections (section), CollectionTabs, CollectionGallery
    catalog/          Catalog (the /search section + its state), FilterBar, FilterPill,
                      FilterPanels, AllFiltersSheet, AppliedFilters, ResultsHeader,
                      SegmentedControl, Pagination, useDismiss, MobileDock,
                      map/ StayMap (lazy), PricePin, mapStyle, maplibre (worker + CSS setup),
                      ZoomControls
    checkout/         the checkout form's sections, SummaryCard, CheckoutChrome (header + slim footer)
    booking/          BookingHeader, SuccessHero, BookedStayCard, QuickActions, NextSteps,
                      PaymentCard, CancellationCard, LocalExperiences, BookingBar, CopyButton
                      (+ useCopy), trip (shared Trip type and helpers)
    stay/             StayHeader, StayGallery, StoryBlocks (host, standards, about, sleep,
                      rules), AmenityGrid, Ratings, StayLocation, LocationMap (lazy),
                      BookingWidget (+ ReserveBar), MessageHost (the host message sheet) + MessageSignIn (its log in / sign up step), StaySection, text (accent), useWishlist
    Header.tsx, Hero.tsx, HowItWorks.tsx, TrustStandards.tsx, InfoSheet.tsx (the FAQ off the home page),
    Reflections.tsx, Faq.tsx, StayCard.tsx,
    FooterEditorial.tsx (the site footer)
```

## Pages & routing

- **`/` (HomePage):** Hero with the search bar, then **(02) Featured stays**, then **(03) Collections**, then **(04) How it works**, then **(05) Trust & standards**, then **(06) Reflections**, then **(07) FAQ**, then the site-wide **(08) Host CTA & footer**. The home page shows **no results**: its search bar holds a draft `Filters` in local state, the CTA previews the count, and submitting calls `navigate('/search?…')`.
- **`/search` (SearchPage):** the search bar at the top (`popoverDirection="down"`), then the **catalogue** (`catalog/Catalog.tsx`, `#stays`):
  - **Filter bar** (`FilterBar`, `lg`+ only): `border-line` pills. **Price**, **Type of stay** and **Capacity** open popovers (Esc or an outside click closes them and returns focus to the pill; each has Clear + a live "Show 4 stays"). **Off-grid** and **Instant book** are toggle pills (`ink` when on). **All filters** carries an `ink` badge with `refinementCount()`. On the right are a `Sort` segmented control (Curated / Price / Newest) and, from `lg`, `Map / Grid`. Both use the shared-layout `ink` pill. Below 1400px they drop to their own line, because the pills alone need ~840px.
  - **Mobile dock** (`MobileDock`, below `lg`, after LUN): the filter bar and sort row are hidden and one floating `ink` pill (milk text and icons, `milk/15` dividers, `graphite-800` hover, a milk count badge) sits at the bottom of the screen (`bottom: max(1.5rem, safe-area)`, portalled): **Search** (icon; opens the mobile search sheet via `openMobileSearch()`, a window event `MobileSearch` listens for) · **Filters** (with the refinement badge; opens the All-filters sheet, where **Sort by** leads as section (01) below `lg`) · **Map** (opens the full-screen map). Only the applied tags stay above the heading, so the list starts right under it.
  - **Panels** (`FilterPanels.tsx`) are shared by the popovers and the sheet. `PricePanel` is two stacked native range inputs (`range-thumbs` utility in `index.css`) over a price histogram, with in-range bars `ink` and the rest `stone-300`. `TypePanel` lists the existing `StayType`s with counts. `CapacityPanel` is bedrooms + `GuestsPanel`. The sheet also has `AmenitiesPanel` and `FeaturesPanel`.
  - **All filters** (`AllFiltersSheet`): portalled, slides in from the right (full screen on mobile), scroll lock, focus trap, Esc. Filters apply live; "Clear all" keeps destination, collection and dates (`clearRefinements`).
  - **Applied tags** (`AppliedFilters`): one removable chip per value ("Mirror house ×", "€400–€600 ×", "Sauna ×") plus "Clear all" (resets the whole URL). Chips enter and exit through `AnimatePresence mode="popLayout"`. When empty, the row reads "(—) No filters applied", so its height never jumps.
  - **Results heading** (`ResultsHeader`): `text-h2`, "14 stays across *9 countries*" / "3 stays in *Lapland, Finland*" / "4 stays in *Forest Homes*" / "2 stays for *“pine”*". The scope is the one serif accent and re-reveals with `lineReveal` when it changes, while the count alone rolls. A mono line below gives dates · nights, guests, and "Prices per night, before taxes". `document.title` follows the heading.
  - **Split view** (Map, from `lg`): the list (7 fr) beside a sticky map (5 fr, `sticky top-[calc(var(--header-h)+1.5rem)] h-[calc(100svh-var(--header-h)-3rem)]`, so it clears the pinned header). Cards are 1-up at `lg` and 2-up from `xl` beside the map, and 3-up in Grid view. Below `lg` there is no split: the dock's **Map** opens the map full screen (portalled, with a "List" pill to close), and maplibre isn't downloaded until then.
  - **Pagination**: 6 per page (`PAGE_SIZE`), `< 1 2 3 … 18 >` via `pageList()`, with a shared-layout `ink` pill (`layoutId` prop, so each pagination animates on its own), centred under a hairline (no "Page 1 of 3" label). Changing page scrolls to the heading.
  - **State:** filters, `sort` and `page` live in the URL. `Catalog` owns `hoveredId` (card hover or focus), `pinId` (pin hover, focus or tap), `searchAsMove` + `bounds`, the sheet, and `view`. Desktop always opens on **Map**; Grid lasts for the visit (it is not persisted). The pipeline is `filterStays` → bounds (only while searching as the map moves) → `sortStays` → `paginate`.
  - **Map** (`map/StayMap.tsx`): OpenFreeMap "positron", restyled before first paint by `mapStyle.ts` (`transformStyle`). Its colours come from the CSS tokens via `getComputedStyle`, so no hex values. Paper land, sand water, hairline roads and borders, graphite labels, and tracked uppercase countries. POI, transit and shield layers are dropped. A milk "Search as I move the map" checkbox sits top centre, and `+` / `—` zoom top right. The compact attribution is folded to its ⓘ on load. Every stay gets a `Marker` once, and its element is a React portal target, so `PricePin` (Framer) animates inside it: pins outside the results shrink away and leave the tab order. Changing the results `fitBounds` them (`DURATION.image`, `cubicBezier(...EASE)`, instant under reduced motion) unless search-as-move is on. Note that MapLibre's CSS sets `position: relative` and a Helvetica font on the map container, so size it with `h-full w-full` and set `font-sans` on anything rendered inside. Its WebGL canvas is composited and escapes a rounded `overflow-hidden`, so the wrapper also clips with `clip-path: inset(0 round var(--radius-frame))`.
  - **Hover sync:** hovering or focusing a card (`StayCard onActiveChange`) fills its pin `accent` and scales it to 1.15. Hovering, focusing or tapping a pin opens a preview (`rounded-frame` milk card: photo, name, ★ rating (reviews), price) that flips below or to the side when it would leave the map. Tapping empty map closes it.
- **The URL is the source of truth** on `/search`: `filtersFromSearch` / `filtersToSearch` in `lib/filters.ts` and `catalogFromSearch` / `searchUrl` in `lib/catalog.ts` parse and sanitise it. A filter change resets the page to 1. Edits on the page use `navigate(url, { replace: true })`, so they don't flood history or move the scroll. Real navigations push and scroll to the top.
- **`/stays/:id` (StayPage):** one stay. Every stay has a page: `storyFor(stay)` merges its `StayStory` (if any) over defaults generated from the `Stay` fields, so a stay without a story still renders every block. An unknown id shows a quiet "(—) Stay not found". `document.title` is the stay's name.
  - **URL:** `?checkIn&checkOut&adults&children&pets` (`stayUrl`). Dates and guests come only from the link (a search that had them, or a shared stay link); otherwise the calendar and booking panel start empty: the fields read "Add date" / "Add guests" and Reserve reads "Check availability" (no dates) or "Add guests" (dates but no party), opening the matching popover. Guests from the link are capped at `stay.guests`. Checkout's gate needs both a bookable range and at least one guest. Both are local state (`useStayBooking`), mirrored back with `replace`. Stay cards, map pin previews, the Collections card and the Reflections photo all link here (`stayUrl`); the catalogue passes the visitor's dates and guests along. "← Back to all stays" goes to `/search` with them.
  - **Header** (`StayHeader`): the back link, the `text-h2` headline (one `*accent*`, revealed with `lineReveal` in one mask), a meta line (★ rating (reviews), the "Guest favourite" `Tag` for ratings ≥ 9.8 with its meaning in a tooltip on hover or focus, region + country, mono coordinates rounded to one decimal by `roughCoordinates()`), and ghost **Share** (`navigator.share`, else clipboard + "Link copied") and **Save** (heart, `localStorage` `solum:wishlist`).
  - **Gallery** (`StayGallery`): from `md` a `3fr / 2fr` grid (hero spanning two rows, two photos stacked), tiles zoom to 1.02 on hover or focus; below `md` a scroll-snap row with a mono `1 / 12` counter. A floating milk pill "Show all 12 photos ↗" (real count) and every tile open a full-screen `Sheet` of all photos (every third full width), landing on the one opened.
  - **Split:** the story (8 of 12 columns) beside the booking panel (4), `sticky top-[calc(var(--header-h)+2rem)]` (clears the pinned header). Story blocks are `StaySection`s: a hairline, a mono `(0N)` index and a light `text-h3` (32px) heading with one accent. In order: "Hosted by *name*" + capacity + "Designed by <architect>", three key standards (hairline icon circles: self check-in, instant confirmation or request to book, off-grid or pets, worded in `data/copy.ts`), About (two paragraphs, "Read more" opens the rest with the accordion height animation), amenities (8 in two columns, "Show all N amenities" opens a side `Sheet` by group, a hairline under every row and no extra divider between groups; only what the house has is listed, nothing struck through), sleeping spaces (`sleepFor()`: one card per bedroom, rooms past the second share a card, so they add up to the header), availability (the shared `DateRangeCalendar`, 2 months from `md`), ratings (four `scaleX` hairline bars out of 10 + two review cards; "Show all N reviews" opens a sheet with every review up to `stay.reviews`, 10 per page, with the catalogue's `Pagination` (own `layoutId`, `bare` + `compact`) pinned in the sheet footer and a mono "Reviews 11–20 of 48" line; a page change scrolls the sheet back to the top. `reviewsFor()` in `lib/reviews.ts` puts the written reviews first, then mock reviews built only from the stay's own facts, seeded by its id so they never change), location, things to know (three columns).
  - **Availability rules** (`lib/availability.ts`): booked nights can't be a check-in; while choosing check-out, days inside the minimum stay or past the next booking are blocked (earlier free days still restart the range, as `pickDate` does). `DateRangeCalendar` takes them as `isUnavailable` and shows a `legend`.
  - **Booking panel** (`BookingWidget`): price / night + ★ badge; a fields panel (Check-in | Checkout, Guests ▾) whose `Popover`s hold the same calendar and adult/child steppers capped at `stay.guests` (pets only where `petFriendly`); **Reserve stay** (`whileTap` scale 0.98, no spring). With no valid range it reads "Check availability" and opens the dates. There is no booking backend yet: Reserve shows an `aria-live` note instead of pretending to book. The breakdown (`quote()`) rolls when the dates change, then "Total before taxes", then at its foot a host card (`HostAvatar` photo, "Hosted by <host>", the reply time `story.host.responds`, and an `ink`-outlined **Message** pill) and a "Questions? Ask us" row (a `mailto:` to us). **Message** opens `stay/MessageHost`, a side `Sheet` to write to the host (also on the booking confirmation). The Message button is visible to everyone, but a conversation belongs to an account (it is saved and replies have somewhere to go), so without one the sheet first shows `MessageSignIn`: the host row, "Log in or sign up to message Sigrún", why, **Continue with Google** / **Continue with Apple** (stacked full-width `line` pills with monochrome `currentColor` marks, so no brand colours; they serve log in and sign up alike) over an "or with email" hairline divider, then a `PillChoice` Log in / Sign up over `StackedPanels` (email + password; sign up adds first name, password ≥ 8, Show/Hide), and the footer button "Log in and continue" / "Sign up and continue". On the booking confirmation it opens on Sign up, filled from the booking. There is no OAuth yet: Google / Apple sign in at once as `{ provider, email: '' }` (the booking's email when there is one), shown as "Signed in with Google" and "the email on your Google account" (`accountLabel`). Any valid email entry signs in (`lib/account.ts`: `setAccount` keeps `{ email, firstName, provider? }` in session storage `solum:account`, never the password; `useAccount()` follows it), and the same sheet moves on to the message. Signed in, it shows the host's portrait, name and reply time, the message (max 1000, live counter), then "Quick questions" chips (`MESSAGE.starters`: Is it pet-friendly? / Early check-in? / Parking?) that add their line to the message or, pressed again (`aria-pressed`, `ink` fill), take it out. Dates and guests already picked open the message as a greeting ("Hi Sigrún, we would like to stay 10–13 Nov, 2 adults."; with the booking reference on the confirmation); if the dates change, only that greeting line is swapped. A "Signed in as … · Log out" line closes the form. There is no messaging or auth backend, so Send shows a sent state (tick mark, reply time, "The reply arrives in your account and by email to …", the message, `MESSAGE.prototype`); a draft survives closing, a sent message clears it. They are part of the panel, so they appear on desktop (sticky sidebar) and mobile (the panel at the end of the story). Below `lg` the panel sits in the flow at the end of the story, after Things to know, and a `ReserveBar` fixed to the foot of the screen (portalled, all the way through the footer; the body gets matching bottom padding while it's mounted) stands in while the panel is out of view.
  - **Location** (`StayLocation` → lazy `LocationMap`): the same restyled basemap, `cooperativeGestures` (Ctrl + scroll / two fingers, so the page scroll is never captured), one ink house marker and a dashed buffer circle of `bufferMetres` (colours via `token()`). maplibre only downloads once the section is within 600px.
- **`/bookings/:ref` (BookingPage):** the confirmation after checkout. "Confirm and pay" builds a `Booking` (first name, email, plan, method, card brand + last 4 only), saves it to `sessionStorage` (`solum:booking:<ref>`, so personal data stays in the tab) and `navigate`s here with `replace` (Back leads to the stay page, not a filled-in form). `loadBooking()` falls back to `DEMO_BOOKINGS`; an unknown ref shows "(—) Booking not found". Amounts are never stored: the page recomputes `quote()` and `splitPlan()`. Same quiet chrome as checkout: `BookingHeader` (logo + mono "Booking reference HXQ-4821", click to copy) and `CheckoutFooter`.
  - **Hero** (`SuccessHero`, `milk` band): a 64px `ink` circle that settles from scale 0.6 (no overshoot), then its tick draws (`pathLength`); "You are booked, *Olena*" (`lineReveal`, request-to-book stays read "Request sent"), where the confirmation went, and a copyable confirmation-code capsule. Focus moves to the `h1`. `CopyButton` shows an `ink` "Copied" pill for 2.4 s, announced politely.
  - **Stay card** (`BookedStayCard`): `rounded-frame` milk panel, photo (absolute, so it follows the text column's height), headline, meta, Check-in / Checkout / Guests (times from `HOUSE_TIMES`), host row with the masked `host.phone` and "Message Ingrid" (opens `MessageHost`, shared with the bar's "Message Ingrid" link; one instance in `BookingPage`).
  - **Quick actions:** Add to calendar (.ics), Get directions (OpenStreetMap at `roughCoordinates`, "exact pin" two days before check-in), Download receipt (.pdf), View in Trips (placeholder note). All files are built client-side in `lib/bookingFiles.ts`.
  - **What happens next** (`NextSteps`): Now / check-in − 2 / check-in, laid out like How it works; arrival text is `story.arrival.steps`.
  - **Payment** (no service-fee line; one "Paid on" line, or the two charges of a split) and **Cancellation** (`cancellationStatus()`: the dated steps with the current one marked "Now", Change dates / Cancel booking as `mailto:`s to us (`mailUs`) until accounts exist).
  - **While you are there** (`LocalExperiences`): `data/experiences.ts` cards for the stay (every stay has four; a new stay needs its own), plain content with no link or hover until experiences have pages; hidden when there are none.
  - **BookingBar:** sticky at the bottom (last in `<main>`): help line, Print confirmation (`window.print()`; actions, experiences and the bar are `print:hidden`) and Go to Trips. The Trips placeholder (`BOOKED.trips`) floats above the bar for 5 s.
- **Header:** **pinned** (`sticky top-0 z-40`). It is transparent at the very top; past 8px of scroll a `paper/85` + `backdrop-blur-md` layer with a `line` hairline fades in. That background is a separate absolute layer: a `backdrop-filter` on the header itself would become the containing block of the fixed mobile menu inside it. Its height is the CSS variable `--header-h` (5rem, on `html` in `index.css`): `html` has `scroll-padding-top: var(--header-h)`, so anchor jumps and `scrollIntoView` land below it (sections keep their `scroll-mt-6` on top), and anything sticky offsets by `var(--header-h)`. Change the header height there, not per component. Overlays must sit at `z-50`+ and be portalled. Layout from `md`: a grid `1fr auto 1fr` (logo left, the menu centred on the page, actions `justify-self-end`, everything `whitespace-nowrap`); below `md` it stays a flex row. The menu is a dark glass capsule (`bg-ink/84`, `backdrop-blur-[18px] saturate`, `border-milk/12`, `shadow-glass`) with `milk/78` links that go `milk` on hover (300ms). It has no sliding pill, no scroll-spy and no current-section dot (`aria-current` stays for assistive tech). Along the header's foot runs a 2px `accent` reading-progress bar (`useScroll` → `scaleX`, every breakpoint). Menu: Stays (`/search`) · Collections (`/#collections`: scrolls on home, or navigates home first, then scrolls) · How it works (`/#how-it-works`, same behaviour) · About (`/#trust`: scrolls there on home, or navigates home first, then scrolls; there is no About sheet). Actions: **List your home** (plain `ink` text with a growing underline, `lg`+, scrolls to the host CTA `/#list-your-home`), **Log in** (the same plain text, `lg`+) and **Sign up** (`Button variant="outline"`: 1px `ink` outline, transparent, fills `ink` on hover, `sm`+). There is no compact search in the header. Log in and Sign up are placeholders (`LOGIN_HREF` / `SIGNUP_HREF` = `#`) until accounts exist. Booking lives in the Stays link and the hero search, so there is no Book a stay button. Below `md` everything moves into the full-screen menu. Routes live in `ROUTES` in `Header.tsx`.
- **Section links** never take anyone off their page to find something: every `/#section` link goes through `goTo()`, which (1) scrolls if the section is on the current page (the footer's `#list-your-home` is on every page), (2) for the home-only reference sections in `INFO_SECTIONS` (only `faq` = questions and the cancellation policy) opens `InfoSheet` on the current page instead, and (3) otherwise navigates home and scrolls (Collections, How it works, About / `#trust`). `InfoSheet` is rendered once in every chrome branch of `App.tsx` (site, checkout, booking) and builds its content from `data/faq.ts` and `data/copy.ts`, so it never drifts from the home page. A new link to a home-only section that other pages need must be added to `INFO_SECTIONS` and `InfoSheet`.
- **Router:** `lib/router.tsx` (no dependency). Use `<Link to>` for internal links, or `linkClick(e, to)` on a `motion.a`; modified clicks (new tab) still behave natively. Vite dev and `vite preview` fall back to `index.html` for deep links, and production hosting needs the same SPA fallback.
- **Featured stays** (`featured/FeaturedStays.tsx`): our starting picks, editorial, no filtering (browsing by landscape is the job of Collections). A horizontal CSS scroll-snap row of `StayCard`s, larger than the grid (≈2.4 cards visible on desktop, capped at 520px, 1.6 on tablet, 86% wide on mobile) so the next card always peeks. The photo height is capped at `max(18rem, 100svh − 20rem)` (`PHOTO`, passed to `StayCard` as `photoClassName`, with `w-full` so the width holds), so a whole card plus the arrow row fits in one screen: 4:5 when there is room, cropped shorter on low screens; the row bleeds to the screen edge below `lg`. The header is the `(02) Featured stays` label with the heading and a right-aligned body line beneath it (count, countries and price range, computed from the picks). The home page cards hide the `N°` index (`showIndex={false}`), because they don't run in catalogue order; the Collections card shows the type only. Under the row sit the controls: filled prev/next circles (`ink`, disabled `line`) that page by one card and disable at either end, then a progress line filling the rest of the width: a 1px `line` track with a 2px `ink` thumb whose width is the share of the row in view and whose offset is how far along it is. The row ends with a catalogue card, "See all N stays" (N = `stays.length`). Focusing a card scrolls it into view; nothing off-screen is hidden from assistive tech. No carousel library: the row logic is `useScrollRow` and the controls are `ui/RowControls`, shared with Reflections. Picks are data in `data/featured.ts`.
- **Collections** (`collections/CuratedCollections.tsx`): a split layout. On the left (4 of 12 columns) is a vertical tile switcher (`CollectionTabs`): each row is 76px tall (`pl-6`, `gap-5`) with a 12px mono index (`graphite-500`, `ink` on hover, `accent` when active), the title (26px, weight 300, −0.025em) and a circular arrow. There are no icons. The active tile gets a shared-layout `sand` fill and an `ink` arrow. Pressing the active tile again opens `/search?collection=<id>`, and so does the "Open collection" button. On the right (8 columns) is `CollectionGallery`: a large stay card (links to `/stays/<id>`, zooms to 1.03 on hover, a ↗ button fades in, always visible on touch screens), the stay's `detail` photo, a mono `1 / 2` counter and prev/next buttons that loop. Switching collection cross-fades the gallery as a whole (keyed `AnimatePresence mode="wait"`, fade + scale 0.98 → 1). Changing slide drifts the cards 4% in the direction of travel over the outgoing slide. Card sizes come from aspect ratios, so nothing jumps between collections. Collections with no stays are hidden.
- **How it works** (`HowItWorks.tsx`, `#how-it-works`): laconic and photo-free. The `(04) How it works` label, then the `text-h2` heading ("From search to *arrival*"), over three steps (pick a home, book your dates, check in with a code). This is the only place on the home page that describes check-in. Each step has a `Step 0N` `Tag`, a light heading with one serif accent, and a body line. From `lg` there are three columns split by vertical `line` hairlines. The dividers sit in the middle of an 80px gap (`-ml-10 pl-10`), so every column has the same text width, and the text starts `mt-24` below the badge. Below `lg` the steps are stacked rows under top hairlines, and from `md` the badge sits on the left (4 / 8 columns). Steps fade up with `STAGGER.base`. On hover a step's badge fills `ink` and its hairline darkens to `stone-500` (decorative only, nothing is focusable).
- **Trust & standards** (`TrustStandards.tsx`, `#trust`): answers the rational doubts before booking. A 5 / 7 column split. On the left is a dark `rounded-frame` panel over its own photo (a timber and glass house on a hillside at dusk, not a stay's, so it doesn't repeat a stay card), like How it works' step 01: no badge or metadata, only one serif-accent line in milk ("Every home is checked in person before it goes *live*.") over an `ink` gradient at its foot. From `lg` the panel has no aspect ratio and stretches to the right column, so its top sits level with the `(05)` row and its bottom lands exactly on the accordion's closing hairline (below `lg` it is 4:5 / 16:10). The photo settles from scale 1.08 → 1 as it scrolls through the viewport (frozen under reduced motion) and zooms to 1.03 on hover. On the right are the `(05) Trust & standards` row, the `text-h2` heading and a three-row accordion between `line` hairlines. Exactly one row is open, and rows switch on **click only** (hover would reflow rows under the cursor). The open row shows its body and, from `sm`, a stay `detail` thumbnail with its caption. Inactive rows darken their hairline to `stone-500` on hover or focus.
- **Reflections** (`Reflections.tsx`, `#reflections`): guest stories rather than catalogue cards. The header mirrors Collections: `(06) Reflections` and a `text-h2` heading ("What guests *say*") on the left, a short body line right-aligned on the right. Below is a horizontal scroll-snap row of story cards, built like Featured stays (`useScrollRow` + `RowControls`, "Previous / Next stories"): ≈3.2 cards visible on desktop, 1.6 on tablet, 86% wide on mobile, bleeding to the screen edge below `lg`, all cards one height. The row has `py-2` so the hover lift isn't clipped by its overflow. Cards reveal with `fadeUp` staggered by `STAGGER.base` (`animate` + `useInView`, like Featured). Each card is a `milk` `rounded-frame` panel with a `line` border and `p-2` (so the inner `rounded-card` photo has concentric corners). It holds a 16:9 stay photo with a `photo` `Tag` (`Name · Location`), linking to `/stays/<id>`; and the review as a `QuoteCard` (`ui/QuoteCard.tsx`, the same component as the stay page's reviews: an upright serif "“" with `tracking-normal`, the `text-body` quote with its one `*accent*` via `Accented`, and a mono `tracking-label` byline: "Name, City" · ★ rating / "Stayed Sept 2026" · "Verified stay"). Only the frame and the photo differ between the two places. On hover, or keyboard focus on the photo link, the card lifts 4px, the photo zooms to 1.03 and the border darkens to `stone-500` (hover is React state, so it doesn't fight the reveal). Reviews are data in `data/reflections.ts` (`stayId` → `Stay.id`; a review whose stay is missing is skipped).
- **FAQ** (`Faq.tsx`, `#faq`): the closing section, practical questions before booking. A 7 / 5 column split (the mirror of Trust's 5 / 7). Row 1: `(07) Questions` and the `text-h2` heading ("Frequently asked *questions*"). Row 2: a numbered accordion on the left (hairline above each row, none below the last), and on the right a bare `rounded-frame` photo of Kiefer Haus at dusk (zooms to 1.03 on hover). From `lg` the photo has no aspect ratio and stretches to the accordion, so its top meets the first question's hairline and its bottom the end of the last row. At most one row is open (01 on load); clicking the open row closes it, rows switch on **click only**. A row is a mono `01` number, a `text-title` (24px) question and a hairline `+` whose vertical stroke rotates 90° onto the horizontal one to read `—`. On hover or focus a closed row's text goes `ink`, its hairline `stone-500`, and the number shifts 4px right. Questions are data in `data/faq.ts`.
- **Host CTA & footer** (`FooterEditorial.tsx`, `#list-your-home`): rendered once in `App.tsx`, so it closes **every page** (chosen over two earlier variants, a dark classic panel and a brutalist statement, which were removed). After an editorial gallery reference. One `rounded-frame` panel in three bands. (1) A `sand` host CTA: the headline set ink-on-sand, "Own a designer *home*? / Rent it out [List your home →] with Solum." (two fixed rows from `lg`, the second row `nowrap`; "Rent it out" is `stone-500`). The second row needs ~70% of the band, so the band is a flex column with the paragraph (`graphite-600`) below the headline, and from `xl` a row with the paragraph (max 320px) beside it, its last line on the headline's last baseline (`items-baseline-last`). The pill is `align-middle` plus `sm:-top-[0.18em]`: middle alignment centres on the x-height, and the 0.18em lift (measured for Geist light, font-relative so it holds at every size; `top`, so Framer keeps `transform`) centres it on the capitals. The pill is a `mailto:` to us with the subject "List my home" (no host application flow yet). It is inverted for the light band (`ink` fill, `milk` arrow circle); on hover or focus it scales to 1.04, darkens to `graphite-800` and the arrow turns −45° to ↗ (no halo). "Rent it out" and the pill stay on one line from `sm` only, since together they are wider than a phone. (2) A photo band: Casa Monolite's concrete room with floor-to-ceiling windows (its `detail` photo, via `unsplash()` with a 1200–2400w `srcSet`), 4:3 → 21:9 → `h-112` from `lg`, drifting −8% → 8% against the scroll (still under reduced motion). (3) An `ink` block: `Logo size="lg"`, a 3-column `nav` (Architecture: Domes & treehouses / Cliff & monoliths / Off-grid homes as `/search` filters + "How we check homes" → `/#trust`; Contact: Instagram, X, Journal + "Email us"; Legal: Privacy policy, Terms of stay + "Cancellation policy" → `/#faq`), links `milk/60 → milk`. Entries with no page yet (Instagram, X, Journal, Privacy, Terms) are plain `milk/60` text, never `href="#"` links: nothing is clickable unless it leads somewhere. and the mono copyright. On dark surfaces use `milk` with opacity steps, never `neutral-*`.

## Search & filters

- **State:** one `Filters` object: the search bar's `collection`, `query`, `checkIn`, `checkOut`, `adults`, `children`, `pets`, plus the catalogue refinements `priceMin` / `priceMax` (0 = open end), `types` (any of), `bedrooms` (at least), `offGrid`, `instantBook` and `amenities` (all of). The search UI is fully controlled and reports changes with `onChange(patch)`. The mobile search sheet's "Clear all" resets only its own fields (`SEARCH_BAR_DEFAULTS`).
- **URL params:** `collection`, `query`, `checkIn` / `checkOut` (a lone `checkIn` is kept, so a half-picked range survives the round trip on `/search`), `adults`, `children`, `pets=1`, `priceMin`, `priceMax`, repeated `type=` and `amenity=` (validated against the known values), `beds`, `offGrid=1`, `instant=1`, plus `sort` and `page` (`lib/catalog.ts`). Defaults are omitted.
- **Logic** is pure (no React) in `src/lib/filters.ts` and `src/lib/dates.ts`. Keep new filter rules there.
- **Filters apply live on `/search`.** From the home hero, submitting navigates there. The CTA reads "Show stays" with no number (the filter popover, the All-filters sheet, the desktop bar and the mobile search sheet).
- **Layout:** `search/SearchBar.tsx` renders the segmented bar (`DesktopSearchBar`) from `lg`, and below `lg` a trigger that opens a full-screen sheet (`MobileSearch`). The sheet is **portalled to `<body>`**, because the hero's animated ancestors keep a `filter`, and that would trap `position: fixed`.
- **Desktop bar:** four segments (Where, Check in, Check out, Guests + CTA). Only one segment is active at a time. The active segment lifts (`bg-milk shadow-lift`) on a `bg-sand` bar, and dividers next to an active or hovered segment fade out. Popovers open **upward** in the hero (the bar is docked at the bottom of the frame, so anything below would be clipped) and **downward** on `/search`, via `popoverDirection`.
- **Flow:** picking a destination moves to check-in, and check-in moves to check-out (see `pickDate()`). A complete range does **not** close the calendar or jump ahead: it stays open (the next pick adjusts the range) until the guest picker is opened, Esc or an outside click. The same holds in the mobile sheet, the stay page's booking panel and the checkout trip summary.
- **Keyboard:** Esc closes and returns focus to the trigger. Tabbing out of the bar or clicking outside closes it. A popover opened from the keyboard (`click.detail === 0`) moves focus inside it. Where is an ARIA combobox (↑/↓ and Enter). The calendar is a roving-tabindex grid (arrows, Home/End, PageUp/PageDown). The mobile sheet traps focus.
- **Destination popover:** two sections. **Recent searches** are the viewer's last 3 submitted searches that had a destination, kept in `localStorage` (`useRecentSearches`, all access in try/catch). Picking one restores query, dates and guests, dropping dates that are already past. **Suggested destinations** are places ("Lapland, Finland") with a stay photo thumbnail and a one-line subtitle, built from the stays data by `buildDestinations()`. A country gets its own entry once it has more than one place. The list shows **at most 7 rows** (`MAX_OPTIONS`): recent searches first, then destinations fill the rest. The popover is also capped at `100svh − 12rem` with internal scroll, so it never runs out of the hero. Typed words match by **prefix** against the place, the country or the country code ("ger" → Uckermark, Germany). Stay search ignores accents and needs every typed word somewhere in name, type, location, country, architect or `landscape` keywords.
- **Dates:** ISO `YYYY-MM-DD` strings, compared as text and computed in UTC. Ranges are half-open (`[checkIn, checkOut)`). A stay is hidden when any `booked` range overlaps the chosen dates. Past days are disabled.
- **Guests:** adults + children ≤ 8. Children require at least one adult (adding a child auto-adds one). `pets` shows only `petFriendly` stays.
- **Animated lists:** a list whose children can mount later (for example filtered results) must use `animate={inView ? 'visible' : 'hidden'}` with `useInView`, **not** `whileInView`. Children mounted after a `whileInView` reveal never pick up the parent's gesture state and stay invisible.

## Data

Mock data lives in `src/data/`, typed and with no backend yet.

- **`Stay`** (`stays.ts`): the fields that matter to features are `location` + `country` + `countryCode` (the destination suggestions), `landscape` (search keywords, where **the first two also label the destination**, e.g. "Dome · Arctic · Pine", so order them deliberately), `guests`, `petFriendly`, `booked` (half-open ISO ranges), `collections` (`CollectionId[]`), `focus` (optional CSS `object-position` for where the house sits in `image`, applied to the 16:9 crop in (06) Reflections; set it when the house is off-centre), `detail` (optional interior or material close-up with a short `caption`, shown beside the stay in (03) Collections; without it the next stay's photo is shown), `excerpt` / `architect` / `coordinates` (card copy; the map parses `coordinates` into its pin position, so keep the `64.2559° N · 21.1299° W` format exact), `rating` (out of 10) + `reviews` (pin preview), `instantBook`, `offGrid`, `amenities` (`Amenity[]`; labels and icons in `AMENITY_LABELS` / `FilterPanels`), and `listed` (ISO date, the "Newest" sort). A new `type` also needs a plural in `PLURAL` (`lib/filters.ts`), which also makes it an option in "Type of stay". N°15 Canopy Treehouse (`Treehouse`) is the flagship stay page.
- **`StayStory`** (`stayStories.ts`, keyed by `Stay.id`): the stay page's rich content, every field optional: `headline` (`*accent*`), `region`, `host` (the owner; a first name, `since` and `responds` default, `photo` a square face-cropped portrait from `portrait(id)` in `stays.ts`, shown by `stay/HostAvatar` in the host section, the booking panel and the confirmation, falling back to the serif initial), `unavailable` (base amenities this house lacks, left out of its list, e.g. Wi-Fi), `rooms`, `standards`, `about` (2–4 factual sentences: what it is, materials, view, access, one distinctive thing), `photos` (hero first, then the two stacked beside it), `amenities` (`AmenityIcon` → Lucide glyph in `AmenityGrid`'s `ICONS`, so a new icon without a glyph is a type error; `group`), `sleep`, `scores` (/10), `reviews` (`*accent*` quotes; every stay has at least three, counting its (06) Reflections quote, which `storyFor()` puts first; a guest appears once), `locationNote`, `bufferMetres`, `nearby`, `rules`, `cleaningFee`, `minNights`, `arrival` (`point` for the directions tile, `steps` for the last stretch, shown on the booking confirmation) and `host.phone` (masked, e.g. "+47 ••• •• 412"). Missing fields come from `storyFor()` defaults.
- **`Collection`** (`collections.ts`): `id`, `title`, `description`. Array order is the switcher order. Adding a collection means adding it here, then tagging stays with its id.
- A new stay automatically appears in destinations, collection counts and search. Every "N stays" total on the site (hero CTA, Collections header, the featured catalogue card) is `stays.length`; per-collection counts can sum higher because a stay may belong to several collections. Keep `index` (`N°07`) sequential.

## Copy

- **Voice:** a guide who has stayed in the house: specific and short. Every sentence says what, where, how much or how. Poetry only in the hero headline. Avoid stillness / silence / quiet / serenity / sanctuary / presence / seamless / engineered / immersive, "X makes room for Y", "shaped by", trailing participles, triads of abstractions and "not X, but Y". At most one em dash per paragraph. "Curated" only for hand-picked, two or three times per page.
- **Roles:** the Solum team speaks as *we / us* ("We visit every home and stay the night", "Email us"; never "curators", "concierge" or "editors"), the *architect / studio* designed the house ("Designed by Form & Skog", never "Curated by"), the *host* owns it and has a name.
- **One version of each fact:** check-in, the address, prices, confirmation, pets, cancellation and the badge live in `data/copy.ts`. Use it rather than restating them. Prices are "per night, before taxes", cleaning is its own line, and there is no Solum service fee. "Instant confirmation" only for `instantBook` homes.
- **Numbers:** counts have no leading zeros ("Show 4 stays", "2 guests", "1 / 12"); `pad()` is for decorative indices only: `(01)`, `Step 01`, accordion rows.
- **No line ends on one word:** headings, labels and buttons balance (`text-wrap: balance`), running text uses `text-wrap: pretty` (both in `index.css`). Pass data strings through `typeset()` (`lib/typography.ts`), which glues number + unit, " / ", the space before an em dash and the last two words with non-breaking spaces; `Accented` does it for `*accent*` strings. In JSX headings, put `NBSP` before the accent span.

---

## Design system

### Aesthetic

Architectural and editorial minimalism. Leave lots of air. Use precise hairlines, a strict grid, and tone-on-tone neutrals, and let photography carry the colour. The references are MOVA for layout (framed hero, docked search, card grid) and Horizon Grove / Kora Modular for type and mood.

### Colour palette

Only use these tokens (`bg-paper`, `text-ink`, `border-line`, …). **Never** hard-code hex values in components, and never add saturated colours.

| Token          | Hex       | Use                                                    |
| -------------- | --------- | ------------------------------------------------------ |
| `ink`          | `#121211` | Primary text, primary buttons, dark surfaces           |
| `graphite-900` | `#1C1C1A` | Dark sections, overlays                                |
| `graphite-800` | `#2A2A27` | Hover on dark buttons, dark borders                    |
| `graphite-600` | `#4A4944` | Secondary text on light                                |
| `stone-500`    | `#8A867D` | Muted text, metadata, placeholders                     |
| `stone-300`    | `#C9C4B8` | Disabled, subtle icons                                 |
| `line`         | `#DEDAD0` | 1px hairline dividers and borders                      |
| `sand`         | `#E8E2D6` | Image placeholders, subtle fills, hover fills          |
| `paper`        | `#F4F1EA` | **Page background** (warm milky off-white)             |
| `milk`         | `#FAF8F3` | Raised surfaces: cards, search bar, menus              |
| `accent`       | `#E25121` | **Booking only**: primary booking CTAs (search, Reserve stay, Request to book / Confirm and pay), selected calendar dates and today's dot, checkout steps and radios, the active map pin, carousel progress thumbs and section numbers. Contrast on `paper` is about 3.4:1 (large or bold text only; white on it is about 3.7:1). Never decorative. Rule: one primary action per screen. |
| `accent-hover` | `#C4431A` | Hover on `accent` buttons |
| `accent-tint`  | `#FBE4DA` | Soft accent fill (reserved) |
| `accent-on-dark` | `#F0794D` | `accent` on `ink` surfaces (reserved) |
| `graphite-500` | `#6B675F` | Collections row numbers |

The `map-*` tokens (`map-land`, `map-water`, `map-park`, …, declared in a `@theme static` block in `index.css`) hold the basemap palette. `catalog/map/mapStyle.ts` reads them through `token()`, so they must stay `static` (Tailwind drops theme variables no utility uses).

**Focus:** keyboard focus is a 2px `accent` outline with a 3px offset on links, buttons and button-like roles (`index.css`, base layer). Text inputs, textareas and selects get no outline of their own (the checkout `Field` wrapper still changes its border). Checkboxes, radios and sliders keep an accent ring, since they have no other cue. Do not add `focus-visible:ring-*` or `outline-none` to links and buttons.

**Logo:** `ui/Logo.tsx` is a plain wordmark (Geist 300, 20px, tracking 0.5em, `margin-right: -0.5em`, `currentColor`); the footer uses it with `light`. The 20px wordmark and the 26px Collections titles are deliberate off-scale exceptions to the 8px type scale.

**Hero:** 16px below the header (`pt-4`); from `lg` the frame is `clamp(600px, 100svh − 112px, 1080px)`, so header, hero and search bar fit the first screen.

On-photo text uses `milk` with opacity steps (`text-milk/70`, `border-milk/20`). Photo overlays are gradients of `ink` (e.g. `from-ink/70 via-ink/10 to-transparent`).

### Typography

| Role        | Font                      | Tailwind                  | Spec                                                                  |
| ----------- | ------------------------- | ------------------------- | --------------------------------------------------------------------- |
| Display     | Geist Variable            | `font-sans text-display`  | weight 300, fluid 48→168px snapped to 8px, leading 0.9, tracking −0.045em |
| H2          | Geist Variable            | `text-h2`                 | weight 300, fluid 40→72px snapped to 8px, leading 0.95, tracking −0.035em |
| H3 step     | Geist Variable            | `text-h3-lg`              | 40px, leading 1.1, tracking −0.03em. Used as `text-h3 lg:text-h3-lg` (How it works steps, the catalogue card, the host initial) |
| H3 section  | Geist Variable            | `text-h3`                 | weight 300, 32px, leading 1.1, tracking −0.03em. Section headings inside a page: `StaySection`, booking `NextSteps` / `LocalExperiences` / `BookedStayCard` |
| Title       | Geist Variable            | `text-title`              | 24px, leading 32px, tracking −0.02em. Card and accordion titles, ledes |
| Body        | Geist Variable            | `text-body`               | 16px, leading 24px (running text adds `leading-[1.55]`), weight 400, colour `graphite-600`. Also every UI label, button, input and 16px mono price |
| Quote       | Instrument Serif / Geist  | `text-quote`              | 48px, leading 1. The serif quote mark, the mobile menu links |
| Label       | Geist Mono                | `text-label`              | 12px, leading 16px. **Mono only**: the smallest size, no sans text below 16px. Uppercase labels (eyebrows, tags, chips, field labels, weekdays, captions, review bylines) add `tracking-label` (+0.14em); count badges add `tracking-normal` |
| Eyebrow     | Geist Mono                | `.eyebrow`                | `text-label`, UPPERCASE, `tracking-label`, colour `stone-500`      |
| Metadata    | Geist Mono                | `font-mono text-label`    | coordinates, capacity, area, indices `(01)`, `N°03`                  |
| Accent word | Instrument Serif *italic* | `accent`                  | **At most one word or phrase per heading**, same size as the heading and weight 400. Every Instrument Serif use (`font-serif` or the `accent` utility) gets tracking `--tracking-serif` (+0.04em) and word spacing `--word-spacing-serif` (+0.08em) from an unlayered rule in `index.css`, because the narrow italic looks cramped at the headings' negative tracking. Change those two tokens, not per element |

**Font sizes come from the 8px scale, never arbitrary values:** 12 (`text-label`, mono only) · 16 (`text-body`) · 24 (`text-title`) · 32 (`text-h3`) · 40 (`text-h3-lg`) · 48 (`text-quote`), plus the fluid tokens (`text-display`, `text-h2`), which reach 64 and 128. `@theme` clears Tailwind's default size scale (`--text-*: initial`), so the preset classes generate no CSS: use only these tokens, never `text-[Npx]`. The fixed tokens bake in line-height and tracking; an explicit `leading-*` / `tracking-*` still overrides them. Fluid sizes must be wrapped in `round(down, clamp(…), 8px)`. Tailwind scans every project file, so `index.css` excludes the Markdown docs (`@source not`), or the examples of forbidden classes quoted here would compile into the CSS. 16px running text uses `leading-[1.55]` (the stay card's on-photo excerpt keeps `leading-snug`). Instrument Serif single glyphs (the host's initial, the quote mark) add `tracking-normal`, which the serif tracking rule respects.

Rules:
- Headings are large, light, and tightly tracked. Contrast comes from **scale and weight**, not colour.
- Numbers in metadata always use `font-mono` with `tabular-nums`.
- Coordinates use this format: `64.2559° N · 21.1299° W`.
- Section indices use this format: `(01)`, `(02)`. Property indices use this format: `N°01`.

### Spacing & layout

- 4/8pt grid. Use only Tailwind's default spacing scale (multiples of 4px).
- Container: `.container-x` = `max-w-[1680px] mx-auto px-4 md:px-6 lg:px-10` (gutters 16 / 24 / 40). Content maxes out at 1600px, so a 1920px screen gets 160px side margins.
- Grid: 12 columns on desktop, `gap-x-6 lg:gap-x-10`. Cards are 3-up on desktop, 2-up on tablet, and 1-up on mobile.
- Section rhythm: `py-24 lg:py-40` (96–160px). Inside a section, keep 48–80px between the header and the content.
- Dividers: `border-line` at 1px. Use them freely to structure the layout: section tops, meta rows, stat cells.
- Radii: `rounded-frame` (28px) for hero and large framed media, `rounded-card` (20px) for cards and panels, `rounded-full` for pills, tags, and buttons.
- Shadows: almost none. Use `shadow-soft` (very diffuse) only for floating panels and popovers, and `shadow-lift` (tight, small) for an element raised inside a surface, such as the active search segment.
- Contrast: text must meet WCAG AA (≥ 4.5:1). On `sand` or `milk`, use `graphite-600` or darker for readable text. `stone-500` is for large or decorative text only, and `stone-300` is for disabled states only.
- Every layout must work at 375px with no horizontal scroll.

### Components

- **Button**: rounded pill in `ink` with `milk` text. On hover the background shifts to `graphite-800` and the arrow icon slides 4px. The `ghost` variant has a transparent background with a `line` border (or `milk/30` on photos, `ghost-light`). `light` is the primary button on dark surfaces (`milk` fill, `ink` text). Pass `icon={false}` to drop the arrow for secondary actions. Height is 44px (md) or 52px (lg).
- **Tag**: pill, 12px mono uppercase (`text-label tracking-label`), `bg-milk/85` with backdrop blur on photos (`photo`), `border-line` on paper, or `border-milk/15` on ink (`dark`). No leading dot.
- **Stay card**: the photo comes first (4:5 aspect ratio, `rounded-card`), with the text on paper below it rather than in a boxed card. The meta row sits between hairlines.
- **Collection tile**: a pill (`h-14`/`h-16`) with a `line` border: mono index, 18px Lucide icon, title, mono count and a circular arrow. Hover fills it `milk` and nudges the arrow 4px. Active has a `sand` fill and an `ink` arrow circle.

---

## Motion language

The feel is soft, slow, and cinematic, in the style of Awwwards sites. Nothing bounces. Springs are only for tiny UI feedback, if ever.

```ts
// src/lib/motion.ts — the single source of truth
export const EASE = [0.16, 1, 0.3, 1] as const   // expo-out, used for everything
export const DURATION = { micro: 0.4, ui: 0.7, reveal: 1.1, image: 1.4, hero: 1.8 }
export const STAGGER = { tight: 0.06, base: 0.12, loose: 0.18 }
```

In CSS the same curve is available as `ease-cinematic` (`--ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1)`).

| Pattern              | Spec                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Hero blur-in**     | Each line sits in an `overflow-hidden` mask and animates from `y: 110%`, `filter: blur(12px)`, `opacity: 0` to rest. `DURATION.reveal`, stagger `STAGGER.base`, `delayChildren ≈ 0.2`. Use the `lineReveal` variant. |
| **Fade-up**          | `y: 24 → 0`, `opacity 0 → 1`, `blur 6px → 0`, `DURATION.reveal`. For sections and cards use `whileInView` with `viewport={{ once: true, margin: '-10% 0px' }}`. |
| **Hero image**       | On load, animates from `scale: 1.08` to `1` over `DURATION.hero`.                     |
| **Card hover**       | Photo `scale: 1.03` over `DURATION.image`. The overlay gradient fades in. The detail panel slides up from `y: 16` with opacity over `DURATION.ui`. |
| **Buttons/links**    | Colour transitions use `duration-500 ease-cinematic`. The arrow translates 4px. Link underlines grow from left (`scale-x 0 → 1`, origin left). |
| **Active indicators**| Shared-layout `layoutId` pill with `transition={{ duration: DURATION.ui, ease: EASE }}`. |
| **Overlays/menus**   | `AnimatePresence`, clip or opacity with `DURATION.ui`. Stagger items by `STAGGER.tight`. |

Rules:
- Always import `EASE`, `DURATION`, `STAGGER`, and the variants from `src/lib/motion.ts`. **No inline magic numbers** for timing or easing.
- `App.tsx` wraps everything in `<MotionConfig reducedMotion="user">`. Don't bypass it.
- Animate only `transform`, `opacity`, and `filter`. Never animate layout properties such as width, height, or top. **Exception:** accordion panels may animate `height: 0 ↔ 'auto'` (one small panel at a time, as in `TrustStandards`).
- Hover effects must also have a `focus-visible` equivalent for keyboard users.

---

## Do / Don't

**Do:** use generous whitespace, hairlines, mono metadata, large light headings, the photo first, and the tone-on-tone palette.
**Don't:** use saturated colours or gradients as decoration, drop shadows on cards, bold headings, more than one serif accent per heading, emoji, bouncy springs, or images without `alt`.

## Imagery

Placeholder photos currently come from the Unsplash CDN (`images.unsplash.com`, with `?w=&q=80&auto=format&fit=crop`). Always render them through `ImageWithFallback`, which shows a tone-on-tone `sand` block if the image fails to load. Replace them with licensed or owned photography before launch.

- **Free photos only.** Use Unsplash License photos (`images.unsplash.com/photo-…`), never Unsplash+ (`plus.unsplash.com/premium_photo-…`, marked "Unsplash+" on the site and `premium: true` in its search data). Every photo URL is built by `unsplash(id, w)` in `data/stays.ts`, which can only produce the free host.
- **Owned photos** (the user's own files) live in `public/photos/` and go through `ownPhoto(file)` in `data/stays.ts`. The CDN can't grade them, so they show as saved: grade the file itself to match `GRADE` if it should blend in, and save it at 2000px wide. One file serves every size: the `?w=` in its URL is only there so components that swap `w=\d+` keep working. None is in use right now: `public/photos/ala-capsule.jpg` (the barrel house, house grade plus a calmer sky) is kept in case it comes back.
- **One look.** `unsplash()` appends the house `GRADE` (`sat=-30&con=-10&high=-15&sepia=8`, applied by the CDN, so there's no CSS filter). Change the grade there, never per photo. When adding a photo, pick muted, soft-light shots (fog, overcast, dusk, interiors in natural light) and avoid saturated blue skies or vivid colour casts. Keep `alt` and `caption` true to what the photo actually shows.
