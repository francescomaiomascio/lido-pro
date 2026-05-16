<script lang="ts">
  import BeachFilterPanel from '../beach/BeachFilterPanel.svelte'
  import type { BeachStatusFilter, BeachUsageFilter } from '../../lib/state/beachFilters'
  import type { BeachStatusSummary } from '../../lib/types/beach'

  let {
    open,
    summary,
    statusFilter,
    usageFilter,
    onClose,
    onStatusFilterChange,
    onUsageFilterChange,
  }: {
    open: boolean
    summary: BeachStatusSummary
    statusFilter: BeachStatusFilter
    usageFilter: BeachUsageFilter
    onClose: () => void
    onStatusFilterChange: (filter: BeachStatusFilter) => void
    onUsageFilterChange: (filter: BeachUsageFilter) => void
  } = $props()
</script>

{#if open}
  <div class="filter-sheet-backdrop" role="presentation" onclick={onClose}></div>
  <aside class="filter-sheet" aria-label="Filtri spiaggia">
    <div class="sheet-header">
      <div>
        <h2>Filtri</h2>
      </div>
      <button class="filter-sheet__close" type="button" aria-label="Chiudi filtri" onclick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" aria-hidden="true">
          <path d="M6 6l12 12"></path>
          <path d="M18 6 6 18"></path>
        </svg>
      </button>
    </div>

    <BeachFilterPanel
      {summary}
      compact
      showSummary={false}
      {statusFilter}
      {usageFilter}
      {onStatusFilterChange}
      {onUsageFilterChange}
    />
    <button class="filter-sheet__inline-close" type="button" aria-label="Chiudi filtri" onclick={onClose}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" aria-hidden="true">
        <path d="M6 6l12 12"></path>
        <path d="M18 6 6 18"></path>
      </svg>
    </button>
  </aside>
{/if}
