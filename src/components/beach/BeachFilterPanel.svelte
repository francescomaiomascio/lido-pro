<script lang="ts">
  import BeachStatusFilters from './BeachStatusFilters.svelte'
  import BeachStatusSummary from './BeachStatusSummary.svelte'
  import BeachUsageFilters from './BeachUsageFilters.svelte'
  import type { BeachStatusFilter, BeachUsageFilter } from '../../lib/state/beachFilters'
  import type { BeachStatusSummary as BeachStatusSummaryType } from '../../lib/types/beach'

  let {
    summary,
    statusFilter,
    usageFilter,
    compact = false,
    showSummary = true,
    onStatusFilterChange,
    onUsageFilterChange,
  }: {
    summary: BeachStatusSummaryType
    statusFilter: BeachStatusFilter
    usageFilter: BeachUsageFilter
    compact?: boolean
    showSummary?: boolean
    onStatusFilterChange: (filter: BeachStatusFilter) => void
    onUsageFilterChange: (filter: BeachUsageFilter) => void
  } = $props()
</script>

<section class="filter-panel" class:compact aria-label="Filtri e riepilogo">
  {#if showSummary}
    <div class="filter-section">
      <h3>Riepilogo</h3>
      <BeachStatusSummary
        {summary}
        activeFilter={statusFilter}
        onFilterChange={onStatusFilterChange}
      />
    </div>
  {/if}

  <div class="filter-section">
    <h3>Gestione</h3>
    <BeachUsageFilters value={usageFilter} onChange={onUsageFilterChange} />
  </div>

  <div class="filter-section">
    <h3>Stato</h3>
    <BeachStatusFilters value={statusFilter} onChange={onStatusFilterChange} />
  </div>
</section>
