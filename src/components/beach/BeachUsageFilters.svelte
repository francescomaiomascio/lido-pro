<script lang="ts">
  import { getBeachItemUsageTypeLabel } from '../../lib/format/beachLabels'
  import { usageFilters, type BeachUsageFilter } from '../../lib/state/beachFilters'

  let {
    value,
    onChange,
  }: {
    value: BeachUsageFilter
    onChange: (value: BeachUsageFilter) => void
  } = $props()

  const usageFilterIcon = (filter: BeachUsageFilter) => {
    if (filter === 'all') return '∗'
    if (filter === 'daily') return 'G'
    return 'S'
  }
</script>

<div class="usage-filters" aria-label="Filtri gestione">
  {#each usageFilters as filter}
    <button
      type="button"
      class:active={value === filter}
      aria-label={filter === 'all' ? 'Tutti' : getBeachItemUsageTypeLabel(filter)}
      title={filter === 'all' ? 'Tutti' : getBeachItemUsageTypeLabel(filter)}
      onclick={() => onChange(filter)}
    >
      {usageFilterIcon(filter)}
    </button>
  {/each}
</div>
