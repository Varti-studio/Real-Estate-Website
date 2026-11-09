// Screenshots of the site's sections for the showcase video.
// Needs the dev server on http://localhost:5173 (npm run dev in the project root).
import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.BASE ?? 'http://localhost:5173'
const OUT = new URL('./shots/', import.meta.url)

// name, path, element to bring to the top (or null), extra scroll, settle time,
// and optionally an element whose bottom should land just above the foot of the screen
const SHOTS = [
  ['01-hero', '/', null, 0, 3000],
  // Scrolled until the first card's photo ends just above the foot, so the houses show in full.
  ['02-featured', '/', 'section[aria-labelledby="featured-title"]', 0, 2500, '#featured-track img'],
  ['03-collections', '/', '#collections', 0, 2500],
  ['04-how', '/', '#how-it-works', 0, 2500],
  ['05-trust', '/', '#trust', 0, 2500],
  ['06-reflections', '/', '#reflections', 0, 2500],
  ['07-faq', '/', '#faq', 0, 2500],
  ['08-footer', '/', '#list-your-home', 0, 2500],
  ['09-search', '/search', null, 0, 6000],
  ['10-stay', '/stays/canopy-treehouse', null, 0, 3500],
  ['11-stay-story', '/stays/canopy-treehouse', null, 1150, 3500],
  ['12-booking', '/bookings/HXQ-4821', null, 0, 3500],
]

const only = process.argv.slice(2)
await mkdir(OUT, { recursive: true })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })

for (const [name, path, selector, offset, settle, fitBottom] of SHOTS) {
  if (only.length && !only.some((o) => name.includes(o))) continue
  await page.goto(BASE + path, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  if (selector) {
    // Scroll in steps so every whileInView reveal on the way fires, then align the section.
    await page.evaluate(async (sel) => {
      const el = document.querySelector(sel)
      const target = el.getBoundingClientRect().top + window.scrollY
      for (let y = 0; y < target; y += 400) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      el.scrollIntoView({ block: 'start', behavior: 'instant' })
    }, selector)
  }
  // Offsets are relative to the section when there is one, absolute otherwise.
  if (offset) await page.evaluate((y, rel) => (rel ? window.scrollBy : window.scrollTo)({ top: y, behavior: 'instant' }), offset, Boolean(selector))
  if (fitBottom)
    await page.evaluate((sel) => {
      const photo = document.querySelector(sel).closest('.rounded-card') ?? document.querySelector(sel)
      window.scrollBy({ top: photo.getBoundingClientRect().bottom - (window.innerHeight + 4), behavior: 'instant' })
    }, fitBottom)
  await new Promise((r) => setTimeout(r, settle))
  await page.screenshot({ path: new URL(`${name}.png`, OUT), type: 'png' })
  console.log('captured', name)
}

await browser.close()
