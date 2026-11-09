import { useState, type KeyboardEvent } from 'react'
import { todayISO } from '../../lib/dates'
import type { RecentSearch } from '../../lib/filters'
import { destinationOptions, optionId, type DestinationOption } from './DestinationPanel'

type Options = {
  listId: string
  query: string
  recent: RecentSearch[]
  onPick: (option: DestinationOption, via: 'keyboard' | 'pointer') => void
}

/** Shared ARIA-combobox behaviour for the destination input (desktop popover and mobile sheet). */
export function useDestinationCombobox({ listId, query, recent, onPick }: Options) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const options = destinationOptions(query, recent, todayISO())

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? options.length : i) - 1)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      onPick(options[activeIndex], 'keyboard')
      setActiveIndex(-1)
    }
  }

  return {
    options,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    /** Reset the highlight whenever the text changes. */
    resetHighlight: () => setActiveIndex(-1),
    inputProps: {
      role: 'combobox' as const,
      'aria-controls': listId,
      'aria-autocomplete': 'list' as const,
      'aria-activedescendant': activeIndex >= 0 ? optionId(listId, activeIndex) : undefined,
    },
    pick: (option: DestinationOption) => {
      onPick(option, 'pointer')
      setActiveIndex(-1)
    },
  }
}
