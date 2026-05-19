<script lang="ts">
  import BeachCanvasShell from '../map-canvas/BeachCanvasShell.svelte'
  import { createActiveLayoutProjection } from '../../lib/layout/layoutProjectionBoundary'
  import { buildOperationalLayoutViewModel } from '../../lib/layout/operationalLayoutViewModel'
  import type { BeachStatusFilter } from '../../lib/state/beachFilters'
  import type { BeachItem, BeachLayout } from '../../lib/types/beach'

  let {
    layout,
    items,
    matchingItemIds,
    selectedItemId,
    searchQuery,
    statusFilter,
    onSelectItem,
    onClearSelection,
    onOpenOperationalPanel,
  }: {
    layout: BeachLayout
    items: BeachItem[]
    matchingItemIds: Set<string>
    selectedItemId: string | null
    searchQuery: string
    statusFilter: BeachStatusFilter
    onSelectItem: (itemId: string) => void
    onClearSelection: () => void
    onOpenOperationalPanel: () => void
  } = $props()

  const activeLayoutProjection = $derived(createActiveLayoutProjection(layout, items))
  const operationalLayoutView = $derived(buildOperationalLayoutViewModel(activeLayoutProjection))
</script>

<section class="beach-map-panel" aria-label="Mappa spiaggia">
  <BeachCanvasShell
    layout={activeLayoutProjection.layout}
    items={operationalLayoutView.items}
    {matchingItemIds}
    {selectedItemId}
    {searchQuery}
    {statusFilter}
    {onSelectItem}
    {onClearSelection}
    {onOpenOperationalPanel}
  />
</section>
