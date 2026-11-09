import { useMemo } from 'react'
import { stays } from '../data/stays'
import { catalogFromSearch, searchUrl, type CatalogState } from '../lib/catalog'
import { filterStays, filtersFromSearch, type Filters } from '../lib/filters'
import { navigate, useLocation } from '../lib/router'
import { Catalog } from '../components/catalog/Catalog'
import { SearchBar } from '../components/search/SearchBar'

/**
 * /search — the URL is the source of truth (filters, sort, page), so results
 * are shareable and the back button works. Edits update it in place.
 */
export function SearchPage() {
  const { search } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const filters = useMemo(() => filtersFromSearch(params), [params])
  const { sort, page } = useMemo(() => catalogFromSearch(params), [params])
  const resultCount = useMemo(() => filterStays(stays, filters).length, [filters])

  /** A filter change starts again from page 1 unless a page is given. */
  const update = (next: Partial<CatalogState> & { filters?: Filters }) =>
    navigate(
      searchUrl(next.filters ?? filters, {
        sort: next.sort ?? sort,
        page: next.page ?? (next.filters ? 1 : page),
      }),
      { replace: true },
    )

  return (
    <main>
      <section className="container-x relative z-20 pt-8 pb-10 lg:pt-12 lg:pb-12">
        <SearchBar
          filters={filters}
          resultCount={resultCount}
          popoverDirection="down"
          onChange={(patch) => update({ filters: { ...filters, ...patch } })}
          onSubmit={() => document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </section>

      <Catalog
        filters={filters}
        sort={sort}
        page={page}
        onChange={update}
        onReset={() => navigate('/search', { replace: true })}
      />
    </main>
  )
}
