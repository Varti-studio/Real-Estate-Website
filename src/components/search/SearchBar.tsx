import type { Filters, RecentSearch } from '../../lib/filters'
import { DesktopSearchBar } from './DesktopSearchBar'
import { MobileSearch } from './MobileSearch'
import { useRecentSearches } from './useRecentSearches'

export type SearchBarProps = {
  filters: Filters
  resultCount: number
  onChange: (patch: Partial<Filters>) => void
  onSubmit: () => void
  /** Popover direction for the desktop bar (default 'up', for the hero). */
  popoverDirection?: 'up' | 'down'
}

/** What the desktop bar and mobile sheet receive on top of `SearchBarProps`. */
export type SearchViewProps = SearchBarProps & { recent: RecentSearch[] }

/**
 * Segmented search. From `lg` up it's an Airbnb-style bar with popovers;
 * below that it collapses into a trigger and a full-screen sheet.
 */
export function SearchBar(props: SearchBarProps) {
  const { recent, record } = useRecentSearches()
  const view: SearchViewProps = {
    ...props,
    recent,
    // Remember searches that name a destination
    onSubmit: () => {
      record(props.filters)
      props.onSubmit()
    },
  }

  return (
    <>
      <div className="hidden w-full lg:block">
        <DesktopSearchBar {...view} />
      </div>
      <div className="w-full lg:hidden">
        <MobileSearch {...view} />
      </div>
    </>
  )
}
