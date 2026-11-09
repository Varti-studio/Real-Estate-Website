import { Fragment } from 'react'
import { History, Search } from 'lucide-react'
import { stays } from '../../data/stays'
import {
  buildDestinations,
  recentPatch,
  recentSubtitle,
  words,
  type Filters,
  type RecentSearch,
} from '../../lib/filters'
import { ImageWithFallback } from '../ui/ImageWithFallback'

const DESTINATIONS = buildDestinations(stays)

type Section = 'recent' | 'suggested' | 'custom'

export interface DestinationOption {
  id: string
  section: Section
  title: string
  subtitle: string
  image?: string
  /** Filters applied when the option is picked. */
  patch: Partial<Filters>
}

/** Every typed word must start a word of the target ("ger" → Germany, "pine" ≠ "alpine"). */
const matches = (target: string, typed: string[]) => {
  const w = words(target)
  return typed.every((t) => w.some((x) => x.startsWith(t)))
}

/** Most rows shown at once; typing narrows the list to the best matches. */
const MAX_OPTIONS = 7

const thumb =(url: string) => url.replace(/([?&])w=\d+/, '$1w=160')

/**
 * Recent searches first, then destinations; both narrowed by the typed text.
 * If nothing matches, a single "Search “…”" option stands in.
 */
export function destinationOptions(query: string, recent: RecentSearch[], today: string): DestinationOption[] {
  const typed = words(query)
  const titleFor = (q: string) => DESTINATIONS.find((d) => d.query.toLowerCase() === q.toLowerCase())?.title ?? q

  const recentOptions: DestinationOption[] = recent
    .filter((r) => matches(`${titleFor(r.query)}`, typed))
    .map((r) => ({
      id: `recent-${r.query}`,
      section: 'recent',
      title: titleFor(r.query),
      subtitle: recentSubtitle(r, today),
      patch: recentPatch(r, today),
    }))

  const suggested: DestinationOption[] = DESTINATIONS.filter((d) => matches(d.keywords, typed)).map((d) => ({
    id: `dest-${d.query}`,
    section: 'suggested',
    title: d.title,
    subtitle: d.subtitle,
    image: thumb(d.image),
    patch: { query: d.query },
  }))

  // Cap the list so the popover stays compact: recent searches first, destinations fill the rest
  const options = [...recentOptions, ...suggested].slice(0, MAX_OPTIONS)
  if (options.length || !typed.length) return options
  return [
    { id: 'custom', section: 'custom', title: `Search “${query.trim()}”`, subtitle: 'Across all stays', patch: { query: query.trim() } },
  ]
}

export const optionId = (listId: string, i: number) => `${listId}-opt-${i}`

type DestinationPanelProps = {
  listId: string
  options: DestinationOption[]
  activeIndex: number
  query: string
  onSelect: (option: DestinationOption) => void
  onHover: (index: number) => void
}

export function DestinationPanel({ listId, options, activeIndex, query, onSelect, onHover }: DestinationPanelProps) {
  const headings: Record<Section, string> = {
    recent: 'Recent searches',
    suggested: query.trim() ? 'Matching destinations' : 'Suggested destinations',
    custom: 'No matching destinations',
  }
  const sections = (['recent', 'suggested', 'custom'] as const).filter((s) => options.some((o) => o.section === s))

  return (
    <div role="listbox" id={listId} aria-label="Destinations">
      {sections.map((section, si) => (
        <Fragment key={section}>
          {si > 0 && <div aria-hidden className="mx-3 my-3 h-px bg-line" />}
          <div role="group" aria-labelledby={`${listId}-${section}`}>
            <p id={`${listId}-${section}`} className="eyebrow px-3 pt-2 pb-3">
              {headings[section]}
            </p>
            {options.map((option, i) =>
              option.section !== section ? null : (
                <OptionRow
                  key={option.id}
                  id={optionId(listId, i)}
                  option={option}
                  active={i === activeIndex}
                  onSelect={() => onSelect(option)}
                  onHover={() => onHover(i)}
                />
              ),
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function OptionRow({
  id,
  option,
  active,
  onSelect,
  onHover,
}: {
  id: string
  option: DestinationOption
  active: boolean
  onSelect: () => void
  onHover: () => void
}) {
  const Icon = option.section === 'recent' ? History : Search
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      // mousedown keeps focus in the input; click would blur it first
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      // Mouse only: a tap that repaints the row on enter is swallowed as a hover by iOS Safari
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover()}
      className={`flex cursor-pointer items-center gap-4 rounded-[16px] p-3 transition-colors duration-500 ease-cinematic ${
        active ? 'bg-sand' : ''
      }`}
    >
      {option.image ? (
        <ImageWithFallback
          src={option.image}
          alt=""
          loading="lazy"
          wrapperClassName="size-12 shrink-0 rounded-[12px]"
        />
      ) : (
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-[12px] transition-colors duration-500 ease-cinematic ${
            active ? 'bg-ink text-milk' : 'bg-sand text-ink'
          }`}
        >
          <Icon size={18} strokeWidth={1.5} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-body tracking-[-0.01em] text-ink">{option.title}</span>
        <span className="truncate text-body text-graphite-600">{option.subtitle}</span>
      </span>
    </div>
  )
}
