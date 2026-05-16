<script lang="ts">
  import BeachCanvasShell from '../map-canvas/BeachCanvasShell.svelte'
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
</script>

<section class="beach-map-panel" aria-label="Mappa spiaggia">
  <BeachCanvasShell
    {layout}
    {items}
    {matchingItemIds}
    {selectedItemId}
    {searchQuery}
    {statusFilter}
    {onSelectItem}
    {onClearSelection}
    {onOpenOperationalPanel}
  />
</section>
