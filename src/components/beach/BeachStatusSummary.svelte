<script lang="ts">
  import { getBeachItemStatusLabel } from '../../lib/format/beachLabels'
  import type { BeachStatusFilter } from '../../lib/state/beachFilters'
  import type { BeachStatusSummary } from '../../lib/types/beach'

  let {
    summary,
    activeFilter,
    onFilterChange,
  }: {
    summary: BeachStatusSummary
    activeFilter: BeachStatusFilter
    onFilterChange: (filter: BeachStatusFilter) => void
  } = $props()
</script>

<section class="status-summary" aria-label="Riepilogo stati">
  <button type="button" class:active={activeFilter === 'all'} onclick={() => onFilterChange('all')}>
    Totale <strong>{summary.total}</strong>
  </button>
  <span>Giornalieri <strong>{summary.daily}</strong></span>
  <span>Stagionali <strong>{summary.seasonal}</strong></span>
  <button type="button" class:active={activeFilter === 'free'} onclick={() => onFilterChange('free')}>
    {getBeachItemStatusLabel('free')} <strong>{summary.free}</strong>
  </button>
  <button
    type="button"
    class:active={activeFilter === 'occupied'}
    onclick={() => onFilterChange('occupied')}
  >
    {getBeachItemStatusLabel('occupied')} <strong>{summary.occupied}</strong>
  </button>
  <button
    type="button"
    class:active={activeFilter === 'reserved'}
    onclick={() => onFilterChange('reserved')}
  >
    {getBeachItemStatusLabel('reserved')} <strong>{summary.reserved}</strong>
  </button>
  <button
    type="button"
    class:active={activeFilter === 'maintenance'}
    onclick={() => onFilterChange('maintenance')}
  >
    Manut. <strong>{summary.maintenance}</strong>
  </button>
</section>
