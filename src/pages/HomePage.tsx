import { useEffect, useMemo, useState } from 'react'
import { stays } from '../data/stays'
import { DEFAULT_FILTERS, filterStays, filtersToSearch, type Filters } from '../lib/filters'
import { navigate } from '../lib/router'
import { Hero } from '../components/Hero'
import { CuratedCollections } from '../components/collections/CuratedCollections'
import { Faq } from '../components/Faq'
import { FeaturedStays } from '../components/featured/FeaturedStays'
import { HowItWorks } from '../components/HowItWorks'
import { Reflections } from '../components/Reflections'
import { TrustStandards } from '../components/TrustStandards'

export function HomePage() {
  // A draft search: nothing on this page is filtered, the bar only previews the count
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const resultCount = useMemo(() => filterStays(stays, filters).length, [filters])

  useEffect(() => {
    document.title = 'Solum — Architecture you can sleep in'
  }, [])

  return (
    <main>
      <Hero
        filters={filters}
        resultCount={resultCount}
        onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onSubmit={() => navigate(`/search${filtersToSearch(filters)}`)}
      />
      <FeaturedStays />
      <CuratedCollections />
      <HowItWorks />
      <TrustStandards />
      <Reflections />
      <Faq />
    </main>
  )
}
