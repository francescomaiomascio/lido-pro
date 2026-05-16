import type { BeachStatusFilter, BeachUsageFilter } from './beachFilters'

export type ActiveBeachView = 'map' | 'list'

export type BeachViewState = {
  activeView: ActiveBeachView
  selectedItemId: string | null
  searchQuery: string
  statusFilter: BeachStatusFilter
  usageFilter: BeachUsageFilter
  diagnosticsOpen: boolean
  beachInfoOpen: boolean
  customerListOpen: boolean
  tariffPanelOpen: boolean
  extraPanelOpen: boolean
  menuOpen: boolean
  filtersOpen: boolean
}

export const createBeachViewState = (): BeachViewState => ({
  activeView: 'map',
  selectedItemId: null,
  searchQuery: '',
  statusFilter: 'all',
  usageFilter: 'all',
  diagnosticsOpen: false,
  beachInfoOpen: false,
  customerListOpen: false,
  tariffPanelOpen: false,
  extraPanelOpen: false,
  menuOpen: false,
  filtersOpen: false,
})
