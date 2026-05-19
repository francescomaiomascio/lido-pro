<script lang="ts">
  import { onMount } from 'svelte'
  import BeachMapControls from '../beach/BeachMapControls.svelte'
  import {
    computeElementActionPanelPlacement,
    mapCanvasConfigStore,
    type ElementActionPlacementResult,
  } from '../../lib/map-canvas'
  import { getBeachDisplayCode } from '../../lib/format/beachDisplayCodes'
  import type { BeachStatusFilter } from '../../lib/state/beachFilters'
  import type { BeachItem, BeachLayout } from '../../lib/types/beach'
  import BeachCanvasStage from './BeachCanvasStage.svelte'
  import SelectedElementActionPanel from './SelectedElementActionPanel.svelte'

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

  let zoomSignal = $state(0)
  let fitSignal = $state(0)
  let resetSignal = $state(0)
  let centerSignal = $state(0)
  let viewportElement: HTMLDivElement | null = $state(null)
  let viewportWidthPx = $state(0)
  let viewportHeightPx = $state(0)
  let selectedAnchor = $state<{ xPx: number; yPx: number } | null>(null)
  const resultCount = $derived(matchingItemIds.size)
  const selectedItem = $derived(
    selectedItemId ? (items.find((item) => item.id === selectedItemId) ?? null) : null,
  )
  const selectedDisplayCode = $derived(selectedItem ? getBeachDisplayCode(selectedItem, items) : '')
  const elementPanelWidthPx = $derived(Math.min(218, Math.max(184, viewportWidthPx - 126)))
  const elementPanelHeightPx = 42
  const elementPanelPlacement = $derived.by<ElementActionPlacementResult | null>(() => {
    if (!selectedAnchor || !selectedItem) {
      return null
    }

    return computeElementActionPanelPlacement({
      anchorXPx: selectedAnchor.xPx,
      anchorYPx: selectedAnchor.yPx,
      panelWidthPx: elementPanelWidthPx,
      panelHeightPx: elementPanelHeightPx,
      viewportWidthPx,
      viewportHeightPx,
      safeMarginPx: 10,
      rightReservePx: 12,
      bottomReservePx: 10,
    })
  })

  const enforceOperationalCanvas = () => {
    mapCanvasConfigStore.updateConfig((config) => ({
      ...config,
      interaction: { ...config.interaction, mode: 'work', snapPreviewEnabled: false },
      zones: { ...config.zones, visible: false },
      walkways: { ...config.walkways, visible: false },
    }))
  }

  $effect(() => {
    if (!viewportElement) {
      return
    }

    const syncSize = () => {
      const rect = viewportElement?.getBoundingClientRect()
      viewportWidthPx = rect?.width ?? 0
      viewportHeightPx = rect?.height ?? 0
    }

    syncSize()
    const observer = new ResizeObserver(syncSize)
    observer.observe(viewportElement)
    return () => observer.disconnect()
  })

  $effect(() => {
    if ($mapCanvasConfigStore.interaction.mode !== 'work') {
      enforceOperationalCanvas()
    }
  })

  onMount(enforceOperationalCanvas)
</script>

<div
  class="beach-map-viewport"
  role="application"
  aria-label="Viewport mappa spiaggia Canvas"
  bind:this={viewportElement}
>
  {#if searchQuery.trim() || statusFilter !== 'all'}
    <div class="map-result-count">{resultCount} risultati</div>
  {/if}

  <BeachMapControls
    onZoomIn={() => (zoomSignal += 0.18)}
    onZoomOut={() => (zoomSignal -= 0.18)}
    onFit={() => (fitSignal += 1)}
    onReset={() => (resetSignal += 1)}
  />

  <SelectedElementActionPanel
    item={selectedItem}
    displayCode={selectedDisplayCode}
    placement={elementPanelPlacement}
    onCenter={() => (centerSignal += 1)}
    onOpenPanel={onOpenOperationalPanel}
    onClose={onClearSelection}
  />

  <BeachCanvasStage
    {layout}
    {items}
    {matchingItemIds}
    {selectedItemId}
    {zoomSignal}
    {fitSignal}
    {resetSignal}
    {centerSignal}
    centerItemId={selectedItemId}
    onSelectedAnchorChange={(anchor) => (selectedAnchor = anchor)}
    {onSelectItem}
  />
</div>
