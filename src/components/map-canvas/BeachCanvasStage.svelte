<script lang="ts">
  import { onMount } from 'svelte'
  import {
    bdfDefaultCanvasBeachSettings,
    createDefaultCanvasCamera,
    getFitPixelsPerMeter,
    hitTestCanvasElements,
    mapCanvasConfigStore,
    MAP_CANVAS_LAYER_ORDER,
    preloadGeneratedCanvasSprites,
    projectCurrentLayoutToCanvasElements,
    renderCanvasBackground,
    renderCanvasElements,
    renderCanvasGrid,
    renderCanvasSelection,
    renderCanvasZones,
    screenToWorldPoint,
    worldToScreenPoint,
    type CanvasCamera,
  } from '../../lib/map-canvas'
  import type { BeachItem, BeachLayout } from '../../lib/types/beach'

  let {
    layout,
    items,
    matchingItemIds,
    selectedItemId,
    zoomSignal = 0,
    fitSignal = 0,
    resetSignal = 0,
    centerSignal = 0,
    centerItemId = null,
    onSelectedAnchorChange = () => undefined,
    onSelectItem,
  }: {
    layout: BeachLayout
    items: BeachItem[]
    matchingItemIds: Set<string>
    selectedItemId: string | null
    zoomSignal?: number
    fitSignal?: number
    resetSignal?: number
    centerSignal?: number
    centerItemId?: string | null
    onSelectedAnchorChange?: (anchor: { xPx: number; yPx: number } | null) => void
    onSelectItem: (itemId: string) => void
  } = $props()

  let hostElement: HTMLDivElement | null = $state(null)
  let canvasElement: HTMLCanvasElement | null = $state(null)
  let viewportWidthPx = $state(0)
  let viewportHeightPx = $state(0)
  let devicePixelRatio = $state(1)
  let camera: CanvasCamera = $state(createDefaultCanvasCamera())
  let lastZoomSignal = $state(0)
  let lastFitSignal = $state(0)
  let lastResetSignal = $state(0)
  let lastCenterSignal = $state(0)
  let isPanning = $state(false)
  let hasDragged = $state(false)
  let startPointer = { xPx: 0, yPx: 0 }
  let startPan = { xPx: 0, yPx: 0 }
  let lastAnchor: { xPx: number; yPx: number } | null = null

  const settings = $derived({
    ...bdfDefaultCanvasBeachSettings,
    ...$mapCanvasConfigStore.beach,
    widthM: layout.widthM,
    depthM: layout.depthM,
    gridStepM: $mapCanvasConfigStore.grid.stepM,
    snapStepM: $mapCanvasConfigStore.rules.snapStepM,
  })
  const canvasElements = $derived(projectCurrentLayoutToCanvasElements(items))
  const selectedCanvasElement = $derived(
    selectedItemId ? (canvasElements.find((element) => element.id === selectedItemId) ?? null) : null,
  )
  const dimmedElementIds = $derived(
    new Set(canvasElements.filter((element) => !matchingItemIds.has(element.id)).map((element) => element.id)),
  )
  const fitPaddingPx = $derived($mapCanvasConfigStore.interaction.mode === 'edit' ? 16 : 10)
  const bottomOverlayReservePx = $derived.by(() => {
    if (viewportHeightPx <= 0) {
      return 0
    }

    if (viewportHeightPx <= 760) {
      return Math.min(152, Math.max(96, viewportHeightPx * 0.16))
    }

    return Math.min(118, Math.max(76, viewportHeightPx * 0.1))
  })
  const safeViewportHeightPx = $derived(Math.max(1, viewportHeightPx - bottomOverlayReservePx))
  const fitPixelsPerMeter = $derived.by(() => {
    const baseFit = getFitPixelsPerMeter({
      beachWidthM: settings.widthM,
      beachDepthM: settings.depthM,
      viewportWidthPx,
      viewportHeightPx: safeViewportHeightPx,
      paddingPx: fitPaddingPx,
    })

    if (!baseFit || viewportWidthPx <= 0 || safeViewportHeightPx <= 0) {
      return baseFit
    }

    const availableWidthPx = Math.max(0, viewportWidthPx - fitPaddingPx * 2)
    const widthFit = availableWidthPx / settings.widthM
    const beachAspect = settings.widthM / settings.depthM
    const viewportAspect = viewportWidthPx / safeViewportHeightPx
    const compressionRatio = viewportAspect / beachAspect

    if (compressionRatio <= 1.28) {
      return baseFit
    }

    const boost = Math.min(
      widthFit / baseFit,
      $mapCanvasConfigStore.interaction.mode === 'edit' ? 1.12 : 1.18,
      1 + (compressionRatio - 1.28) * 0.24,
    )

    return baseFit * Math.max(1, boost)
  })
  const renderCamera = $derived({
    ...camera,
    panXPx: (viewportWidthPx - settings.widthM * fitPixelsPerMeter * camera.zoom) / 2 + camera.panXPx,
    panYPx: (safeViewportHeightPx - settings.depthM * fitPixelsPerMeter * camera.zoom) / 2 + camera.panYPx,
    devicePixelRatio,
  })

  const draw = () => {
    if (!canvasElement || !fitPixelsPerMeter) {
      return
    }

    const context = canvasElement.getContext('2d')

    if (!context) {
      return
    }

    canvasElement.width = Math.max(1, Math.floor(viewportWidthPx * devicePixelRatio))
    canvasElement.height = Math.max(1, Math.floor(viewportHeightPx * devicePixelRatio))
    canvasElement.style.width = `${viewportWidthPx}px`
    canvasElement.style.height = `${viewportHeightPx}px`

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    context.clearRect(0, 0, viewportWidthPx, viewportHeightPx)

    for (const layer of MAP_CANVAS_LAYER_ORDER) {
      if (layer === 'background') {
        renderCanvasBackground({
          context,
          settings,
          config: $mapCanvasConfigStore,
          pixelsPerMeter: fitPixelsPerMeter,
          camera: renderCamera,
        })
      }
      if (layer === 'zones') {
        renderCanvasZones({
          context,
          config: $mapCanvasConfigStore,
          pixelsPerMeter: fitPixelsPerMeter,
          camera: renderCamera,
        })
      }
      if (layer === 'grid') {
        renderCanvasGrid({
          context,
          settings,
          config: $mapCanvasConfigStore,
          pixelsPerMeter: fitPixelsPerMeter,
          camera: renderCamera,
        })
      }
      if (layer === 'assets') {
        renderCanvasElements({
          context,
          elements: canvasElements,
          dimmedElementIds,
          selectedElementId: selectedItemId,
          config: $mapCanvasConfigStore,
          pixelsPerMeter: fitPixelsPerMeter,
          camera: renderCamera,
        })
      }
      if (layer === 'selection') {
        renderCanvasSelection({
          context,
          selectedElement: selectedCanvasElement,
          config: $mapCanvasConfigStore,
          pixelsPerMeter: fitPixelsPerMeter,
          camera: renderCamera,
        })
      }
    }
  }

  const fitStage = () => {
    camera = {
      ...camera,
      zoom: 1,
      panXPx: 0,
      panYPx: 0,
      devicePixelRatio,
    }
  }

  const resetStage = () => {
    fitStage()
  }

  const zoomStage = (delta: number) => {
    camera = {
      ...camera,
      zoom: Math.min(4, Math.max(0.5, camera.zoom + delta)),
    }
  }

  const centerStageOnItem = (itemId: string | null) => {
    if (!itemId || !fitPixelsPerMeter || viewportWidthPx <= 0 || safeViewportHeightPx <= 0) {
      return
    }

    const element = canvasElements.find((candidate) => candidate.id === itemId)

    if (!element) {
      return
    }

    const basePanXPx = (viewportWidthPx - settings.widthM * fitPixelsPerMeter * camera.zoom) / 2
    const basePanYPx = (safeViewportHeightPx - settings.depthM * fitPixelsPerMeter * camera.zoom) / 2

    camera = {
      ...camera,
      panXPx: viewportWidthPx / 2 - element.xM * fitPixelsPerMeter * camera.zoom - basePanXPx,
      panYPx: safeViewportHeightPx / 2 - element.yM * fitPixelsPerMeter * camera.zoom - basePanYPx,
    }
  }

  const getCanvasPoint = (event: PointerEvent) => {
    const rect = canvasElement?.getBoundingClientRect()

    return {
      xPx: event.clientX - (rect?.left ?? 0),
      yPx: event.clientY - (rect?.top ?? 0),
    }
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (!canvasElement || !$mapCanvasConfigStore.interaction.panEnabled) {
      return
    }

    isPanning = true
    hasDragged = false
    startPointer = { xPx: event.clientX, yPx: event.clientY }
    startPan = { xPx: camera.panXPx, yPx: camera.panYPx }
    canvasElement.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!isPanning || !$mapCanvasConfigStore.interaction.panEnabled) {
      return
    }

    const deltaXPx = event.clientX - startPointer.xPx
    const deltaYPx = event.clientY - startPointer.yPx
    hasDragged = hasDragged || Math.hypot(deltaXPx, deltaYPx) > 5
    camera = {
      ...camera,
      panXPx: startPan.xPx + deltaXPx,
      panYPx: startPan.yPx + deltaYPx,
    }
  }

  const handlePointerUp = (event: PointerEvent) => {
    if (!canvasElement) {
      return
    }

    canvasElement.releasePointerCapture(event.pointerId)
    isPanning = false

    if (hasDragged || fitPixelsPerMeter <= 0) {
      return
    }

    const pointPx = getCanvasPoint(event)
    const pointM = screenToWorldPoint({
      xPx: pointPx.xPx,
      yPx: pointPx.yPx,
      pixelsPerMeter: fitPixelsPerMeter,
      camera: renderCamera,
    })
    const hitElement = hitTestCanvasElements({
      pointM,
      elements: canvasElements,
    })

    if (hitElement) {
      onSelectItem(hitElement.id)
    }
  }

  const handlePointerCancel = (event: PointerEvent) => {
    canvasElement?.releasePointerCapture(event.pointerId)
    isPanning = false
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    if (!$mapCanvasConfigStore.interaction.zoomEnabled) {
      return
    }
    zoomStage(event.deltaY > 0 ? -0.12 : 0.12)
  }

  onMount(() => {
    mapCanvasConfigStore.hydrate()
    preloadGeneratedCanvasSprites().finally(() => {
      draw()
    })

    if (!hostElement) {
      return
    }

    const syncSize = (entry: ResizeObserverEntry) => {
      viewportWidthPx = entry.contentRect.width
      viewportHeightPx = entry.contentRect.height
      devicePixelRatio = window.devicePixelRatio || 1
      camera = {
        ...camera,
        devicePixelRatio,
      }
    }
    const observer = new ResizeObserver(([entry]) => syncSize(entry))

    observer.observe(hostElement)
    return () => observer.disconnect()
  })

  $effect(() => {
    if (zoomSignal !== lastZoomSignal) {
      zoomStage(zoomSignal - lastZoomSignal)
      lastZoomSignal = zoomSignal
    }
  })

  $effect(() => {
    if (fitSignal !== lastFitSignal) {
      fitStage()
      lastFitSignal = fitSignal
    }
  })

  $effect(() => {
    if (resetSignal !== lastResetSignal) {
      resetStage()
      lastResetSignal = resetSignal
    }
  })

  $effect(() => {
    if (centerSignal !== lastCenterSignal) {
      centerStageOnItem(centerItemId)
      lastCenterSignal = centerSignal
    }
  })

  $effect(() => {
    if (!selectedCanvasElement || !fitPixelsPerMeter || viewportWidthPx <= 0 || viewportHeightPx <= 0) {
      if (lastAnchor) {
        lastAnchor = null
        onSelectedAnchorChange(null)
      }
      return
    }

    const nextAnchor = worldToScreenPoint({
      point: { xM: selectedCanvasElement.xM, yM: selectedCanvasElement.yM },
      pixelsPerMeter: fitPixelsPerMeter,
      camera: renderCamera,
    })
    const changed =
      !lastAnchor ||
      Math.abs(lastAnchor.xPx - nextAnchor.xPx) > 0.5 ||
      Math.abs(lastAnchor.yPx - nextAnchor.yPx) > 0.5

    if (changed) {
      lastAnchor = nextAnchor
      onSelectedAnchorChange(nextAnchor)
    }
  })

  $effect(() => {
    draw()
  })
</script>

<div
  class="beach-canvas-stage"
  class:panning={isPanning}
  bind:this={hostElement}
  aria-label={`${items.length} elementi spiaggia su Canvas`}
>
  {#if $mapCanvasConfigStore.interaction.mode === 'edit'}
    <div class="beach-canvas-edit-badge">Modifica</div>
  {/if}
  <canvas
    bind:this={canvasElement}
    aria-label="Mappa spiaggia Canvas"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerCancel}
    onwheel={handleWheel}
  ></canvas>
</div>
