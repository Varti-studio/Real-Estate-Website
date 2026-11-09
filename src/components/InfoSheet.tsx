import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CANCELLATION } from '../data/copy'
import { faq } from '../data/faq'
import { pad } from '../lib/format'
import { fadeUp } from '../lib/motion'
import { useInfoSheet } from '../lib/router'
import { typeset } from '../lib/typography'
import { MonoLabel } from './ui/MonoLabel'
import { Sheet } from './ui/Sheet'

/**
 * The home page's FAQ and cancellation policy, in a side sheet. `goTo` opens
 * it when a link points at `/#faq` from a page that doesn't have it, so the
 * link has its content on every page. Rendered once per chrome in `App.tsx`.
 */
export function InfoSheet() {
  const [section, close] = useInfoSheet()

  return (
    <Sheet open={section !== null} onClose={close} title="Questions & cancellation">
      <Questions />
    </Sheet>
  )
}

function Questions() {
  const others = faq.filter((item) => !/cancel/i.test(item.question))
  return (
    <>
      <Block index="(01)" title="Cancellation policy">
        {CANCELLATION.rules.map((rule) => (
          <li key={rule} className="border-b border-line py-4 text-body text-ink">
            {typeset(rule)}
          </li>
        ))}
        <li className="py-4 text-body leading-[1.55] text-graphite-600">The same policy applies to every home.</li>
      </Block>

      <Block index="(02)" title="Frequently asked questions">
        {others.map((item, i) => (
          <Row key={item.question} index={pad(i + 1)} title={item.question} body={item.answer} />
        ))}
      </Block>
    </>
  )
}

function Block({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <motion.section variants={fadeUp} aria-label={title} className="pt-10 pb-2 last:pb-10">
      <div className="flex items-baseline gap-3">
        <MonoLabel>{index}</MonoLabel>
        <MonoLabel className="text-ink">{title}</MonoLabel>
      </div>
      <ul className="mt-4 border-t border-line">{children}</ul>
    </motion.section>
  )
}

function Row({ index, title, body }: { index?: string; title: string; body: string }) {
  return (
    <li className="flex gap-4 border-b border-line py-5">
      {index && <span className="w-6 shrink-0 pt-1 font-mono text-label text-stone-500 tabular-nums">{index}</span>}
      <div className="flex flex-col gap-2">
        <h3 className="text-title leading-[1.3] tracking-[-0.02em] text-ink">{typeset(title)}</h3>
        <p className="text-body leading-[1.55] text-graphite-600">{typeset(body)}</p>
      </div>
    </li>
  )
}
