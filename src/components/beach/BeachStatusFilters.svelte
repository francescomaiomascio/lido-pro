<script lang="ts">
  import { getBeachItemStatusLabel } from '../../lib/format/beachLabels'
  import { statusFilters, type BeachStatusFilter } from '../../lib/state/beachFilters'

  let {
    value,
    onChange,
  }: {
    value: BeachStatusFilter
    onChange: (value: BeachStatusFilter) => void
  } = $props()

  const statusFilterIcon = (filter: BeachStatusFilter) => {
    if (filter === 'all') return '∗'
    if (filter === 'free') return '○'
    if (filter === 'occupied') return '●'
    if (filter === 'reserved') return '◐'
    return '!'
  }
</script>

<div class="status-filters" aria-label="Filtri stato">
  {#each statusFilters as filter}
    <button
      type="button"
      class:active={value === filter}
      aria-label={filter === 'all' ? 'Tutti' : getBeachItemStatusLabel(filter)}
      title={filter === 'all' ? 'Tutti' : getBeachItemStatusLabel(filter)}
      onclick={() => onChange(filter)}
    >
      {statusFilterIcon(filter)}
    </button>
  {/each}
</div>
