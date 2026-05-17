<script lang="ts">
  import BeachMapControls from '../beach/BeachMapControls.svelte'
  import {
    computeElementActionPanelPlacement,
    mapCanvasConfigStore,
    type ElementActionPlacementResult,
    type MapCanvasStudioToolId,
  } from '../../lib/map-canvas'
  import { getBeachDisplayCode } from '../../lib/format/beachDisplayCodes'
  import type { BeachStatusFilter } from '../../lib/state/beachFilters'
  import type { BeachItem, BeachLayout } from '../../lib/types/beach'
  import BeachCanvasStage from './BeachCanvasStage.svelte'
  import CanvasStudioFlyout from './CanvasStudioFlyout.svelte'
  import CanvasStudioRail from './CanvasStudioRail.svelte'
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
  let canvasStudio = $state<{ isOpen: boolean; activeToolId: MapCanvasStudioToolId | null }>({
    isOpen: false,
    activeToolId: null,
  })
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

  const selectStudioTool = (toolId: MapCanvasStudioToolId) => {
    if ($mapCanvasConfigStore.interaction.mode !== 'edit') {
      mapCanvasConfigStore.updateConfig((config) => ({
        ...config,
        interaction: { ...config.interaction, mode: 'edit', snapPreviewEnabled: true },
        grid: { ...config.grid, visible: true, opacity: Math.max(config.grid.opacity, 0.48) },
      }))
    }
    canvasStudio.activeToolId = toolId
    canvasStudio.isOpen = true
  }

  const closeCanvasStudio = () => {
    canvasStudio.isOpen = false
    canvasStudio.activeToolId = null
    mapCanvasConfigStore.updateConfig((config) => ({
      ...config,
      interaction: { ...config.interaction, mode: 'work', snapPreviewEnabled: false },
      zones: { ...config.zones, visible: false },
      walkways: { ...config.walkways, visible: false },
    }))
  }

  const toggleCanvasStudio = () => {
    if (canvasStudio.isOpen) {
      closeCanvasStudio()
      return
    }

    mapCanvasConfigStore.updateConfig((config) => ({
      ...config,
      interaction: { ...config.interaction, mode: 'edit', snapPreviewEnabled: true },
      grid: { ...config.grid, visible: true, opacity: Math.max(config.grid.opacity, 0.48) },
    }))
    canvasStudio.isOpen = true
    canvasStudio.activeToolId = null
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
    if ($mapCanvasConfigStore.interaction.mode === 'work' && canvasStudio.isOpen) {
      canvasStudio.isOpen = false
    }
  })
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

  {#if !canvasStudio.isOpen}
    <button
      type="button"
      class="canvas-studio-toggle"
      aria-label={$mapCanvasConfigStore.interaction.mode === 'edit'
        ? 'Mostra Canvas Studio'
        : 'Attiva modalità modifica e apri Canvas Studio'}
      aria-pressed={canvasStudio.isOpen}
      onclick={toggleCanvasStudio}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m15 4 5 5"></path>
        <path d="M14 5 3 16l5 5L19 10"></path>
        <path d="m9 4 .6 1.6L11 6.2l-1.4.6L9 8.4l-.6-1.6L7 6.2l1.4-.6L9 4Z"></path>
        <path d="m19 14 .6 1.6 1.4.6-1.4.6-.6 1.6-.6-1.6-1.4-.6 1.4-.6L19 14Z"></path>
      </svg>
    </button>
  {/if}

  {#if canvasStudio.isOpen}
    <CanvasStudioRail
      activeToolId={canvasStudio.activeToolId}
      onClose={toggleCanvasStudio}
      onSelectTool={selectStudioTool}
    />
    {#if canvasStudio.activeToolId}
      <CanvasStudioFlyout
        activeToolId={canvasStudio.activeToolId}
        {items}
      />
    {/if}
  {/if}

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
