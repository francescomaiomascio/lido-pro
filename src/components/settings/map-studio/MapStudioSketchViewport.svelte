<script lang="ts">
  import { onMount } from 'svelte'
  import type { SeaSide } from '../../../lib/map-canvas/types'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioSelectedHandle } from './state/mapStudioManipulation'
  import type { MapStudioProjectModel } from './state/mapStudioProjectModel'
  import type { MapStudioScopeId } from './state/mapStudioScope'
  import {
    distanceBetween,
    formatMeters,
    type SketchDimension,
  } from './state/sketchDimensions'
  import type { SketchDisplayState } from './state/sketchDisplay'
  import {
    buildSketchEntities,
    type SketchEntity,
  } from './state/sketchEntities'
  import { snapToGrid } from './state/sketchSnapping'
  import type { SketchCommandId } from './state/sketchTools'
  import {
    fitSketchViewport,
    screenToWorld,
    worldToScreen,
    zoomSketchViewportAt,
    type SketchPoint,
    type SketchViewportState,
  } from './state/sketchCanvasState'

  let {
    projectModel,
    projectState,
    activeCommand,
    fitRequest,
    display,
    viewport,
    onViewportChange,
    onPointerWorldChange,
    onScopeChange,
    onScopeHover,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
    onSeaSideChange,
  }: {
    projectModel: MapStudioProjectModel
    projectState: MapStudioProjectState
    activeCommand: SketchCommandId
    fitRequest: number
    display: SketchDisplayState
    viewport: SketchViewportState
    onViewportChange: (viewport: SketchViewportState) => void
    onPointerWorldChange: (point?: SketchPoint) => void
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
    onManipulationStart: (handle: MapStudioSelectedHandle, previewOnly?: boolean) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
    onSeaSideChange: (seaSide: SeaSide) => void
  } = $props()

  type ActiveDrag =
    | { kind: 'pan'; pointerId: number; startScreen: SketchPoint; startViewport: SketchViewportState }
    | { kind: 'width' | 'depth' | 'marginTop'; pointerId: number; currentValue: number }
    | { kind: 'measure'; pointerId: number; start: SketchPoint }

  let svgElement: SVGSVGElement | null = $state(null)
  let hostElement: HTMLDivElement | null = $state(null)
  let viewportSize = $state({ width: 1200, height: 720 })
  let activeDrag: ActiveDrag | null = $state(null)
  let measurement = $state<SketchDimension | null>(null)
  let lastFitRequest = $state(0)

  const entities = $derived(buildSketchEntities(projectModel))
  const perimeter = $derived({
    x: viewport.panX,
    y: viewport.panY,
    width: projectModel.perimeter.widthM * viewport.scale,
    height: projectModel.perimeter.depthM * viewport.scale,
  })
  const selectedScope = $derived(projectState.activeScope)

  const screenPointFromEvent = (event: PointerEvent | WheelEvent): SketchPoint => {
    const rect = svgElement?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const worldPointFromEvent = (event: PointerEvent | WheelEvent) =>
    screenToWorld(screenPointFromEvent(event), viewport)

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))

  const activateOnKey = (event: KeyboardEvent, callback: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    callback()
  }

  const handleFor = (
    kind: 'width' | 'depth' | 'marginTop',
    proposedValue: number,
    currentValue: number,
  ): MapStudioSelectedHandle => {
    if (kind === 'width') {
      return {
        kind: 'perimeter-side',
        id: 'perimeter-width',
        label: 'Larghezza perimetro',
        targetScope: 'perimeter',
        tool: 'perimeterEdit',
        manipulation: 'dragHandle',
        affectedParameter: 'beach.widthM',
        currentValue,
        proposedValue,
        unit: 'm',
      }
    }
    if (kind === 'depth') {
      return {
        kind: 'perimeter-side',
        id: 'perimeter-depth',
        label: 'Profondita perimetro',
        targetScope: 'perimeter',
        tool: 'perimeterEdit',
        manipulation: 'dragHandle',
        affectedParameter: 'beach.depthM',
        currentValue,
        proposedValue,
        unit: 'm',
      }
    }
    return {
      kind: 'margin-guide',
      id: 'margin-top',
      label: 'Margine mare',
      targetScope: 'perimeter',
      tool: 'perimeterEdit',
      manipulation: 'dragHandle',
      affectedParameter: 'beach.marginsM.top',
      currentValue,
      proposedValue,
      unit: 'm',
    }
  }

  const startPerimeterDrag = (event: PointerEvent, kind: 'width' | 'depth' | 'marginTop') => {
    event.preventDefault()
    event.stopPropagation()
    const currentValue =
      kind === 'width'
        ? projectModel.perimeter.widthM
        : kind === 'depth'
          ? projectModel.perimeter.depthM
          : projectModel.perimeter.marginsM.top
    activeDrag = { kind, pointerId: event.pointerId, currentValue }
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
    onScopeChange('perimeter')
    onManipulationStart(handleFor(kind, currentValue, currentValue))
  }

  const updatePerimeterDrag = (event: PointerEvent, drag: Extract<ActiveDrag, { kind: 'width' | 'depth' | 'marginTop' }>) => {
    const world = snapToGrid(worldPointFromEvent(event), 0.25).point
    const proposedValue =
      drag.kind === 'width'
        ? clamp(world.x, 4, 90)
        : drag.kind === 'depth'
          ? clamp(world.y, 4, 90)
          : clamp(world.y, 0, Math.max(0.25, projectModel.perimeter.depthM - projectModel.perimeter.marginsM.bottom - 0.25))
    onManipulationUpdate(handleFor(drag.kind, proposedValue, drag.currentValue))
  }

  const startMeasure = (event: PointerEvent) => {
    if (activeCommand !== 'measure') return
    event.preventDefault()
    const start = snapToGrid(worldPointFromEvent(event), 0.25).point
    activeDrag = { kind: 'measure', pointerId: event.pointerId, start }
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
    measurement = { id: 'measure-live', label: 'Misura', start, end: start, valueM: 0, temporary: true }
    onManipulationStart({
      kind: 'measurement-distance',
      id: 'measurement-live',
      label: 'Misura temporanea',
      targetScope: 'project',
      tool: 'measure',
      manipulation: 'measureDistance',
      affectedParameter: 'measurement.distanceM',
      currentValue: 0,
      proposedValue: 0,
      unit: 'm',
    }, true)
  }

  const startPan = (event: PointerEvent) => {
    if (activeCommand !== 'pan') return
    event.preventDefault()
    activeDrag = {
      kind: 'pan',
      pointerId: event.pointerId,
      startScreen: screenPointFromEvent(event),
      startViewport: viewport,
    }
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent) => {
    const world = worldPointFromEvent(event)
    onPointerWorldChange(world)
    if (!activeDrag) return
    if (activeDrag.kind === 'pan') {
      const screen = screenPointFromEvent(event)
      onViewportChange({
        ...activeDrag.startViewport,
        panX: activeDrag.startViewport.panX + screen.x - activeDrag.startScreen.x,
        panY: activeDrag.startViewport.panY + screen.y - activeDrag.startScreen.y,
        fitMode: false,
      })
      return
    }
    if (activeDrag.kind === 'measure') {
      const end = snapToGrid(world, 0.25).point
      const valueM = distanceBetween(activeDrag.start, end)
      measurement = { id: 'measure-live', label: 'Misura', start: activeDrag.start, end, valueM, temporary: true }
      onManipulationUpdate({
        kind: 'measurement-distance',
        id: 'measurement-live',
        label: 'Misura temporanea',
        targetScope: 'project',
        tool: 'measure',
        manipulation: 'measureDistance',
        affectedParameter: 'measurement.distanceM',
        currentValue: 0,
        proposedValue: valueM,
        unit: 'm',
      })
      return
    }
    updatePerimeterDrag(event, activeDrag)
  }

  const handlePointerUp = () => {
    if (!activeDrag) return
    activeDrag = null
    onManipulationFinish()
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    const deltaScale = event.deltaY > 0 ? 0.92 : 1.08
    onViewportChange(zoomSketchViewportAt(viewport, screenPointFromEvent(event), deltaScale))
  }

  const entityScreenRect = (entity: SketchEntity) => {
    const topLeft = worldToScreen({ x: entity.xM, y: entity.yM }, viewport)
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: entity.widthM * viewport.scale,
      height: entity.depthM * viewport.scale,
    }
  }

  const trackColor = (objectType?: string) => {
    if (objectType === 'umbrella') return '#b45a50'
    if (objectType === 'small_palm') return '#6a9b3d'
    return '#14855f'
  }

  const drawEntityFootprints = (track: SketchEntity) => {
    const modelTrack = projectModel.tracks.find((candidate) => candidate.id === track.trackId)
    if (!modelTrack || modelTrack.itemCount <= 0) return []
    const objectParameter = projectModel.objectParameters.find((candidate) => candidate.objectType === modelTrack.family)
    if (!objectParameter) return []
    const count = Math.min(modelTrack.itemCount, 64)
    const usableWidth = Math.max(0.5, track.widthM)
    const step = usableWidth / count
    return Array.from({ length: count }, (_, index) => ({
      id: `${track.id}-item-${index}`,
      cx: track.xM + step * (index + 0.5),
      cy: track.yM,
      r: objectParameter.footprintMeters / 2,
      clearance: objectParameter.clearanceMeters / 2,
      color: trackColor(modelTrack.family),
    }))
  }

  onMount(() => {
    const updateSize = () => {
      const rect = hostElement?.getBoundingClientRect()
      if (!rect) return
      viewportSize = { width: rect.width, height: rect.height }
      if (viewport.fitMode) {
        onViewportChange(fitSketchViewport({ width: rect.width, height: rect.height }, {
          widthM: projectModel.perimeter.widthM,
          depthM: projectModel.perimeter.depthM,
        }))
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (hostElement) observer.observe(hostElement)
    return () => observer.disconnect()
  })

  $effect(() => {
    if (fitRequest === lastFitRequest) return
    lastFitRequest = fitRequest
    if (!hostElement) return
    const rect = hostElement.getBoundingClientRect()
    onViewportChange(fitSketchViewport({ width: rect.width, height: rect.height }, {
      widthM: projectModel.perimeter.widthM,
      depthM: projectModel.perimeter.depthM,
    }))
  })
</script>

<div class="map-sketch-viewport" bind:this={hostElement}>
  <svg
    bind:this={svgElement}
    viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
    role="application"
    aria-label="Canvas sketch parametrico"
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    onpointerleave={() => onPointerWorldChange(undefined)}
    onwheel={handleWheel}
  >
    <defs>
      <pattern id="sketch-grid-small" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0v24" fill="none" stroke="rgba(13,81,75,.07)" stroke-width="1" />
      </pattern>
      <pattern id="sketch-grid-large" width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="url(#sketch-grid-small)" />
        <path d="M120 0H0v120" fill="none" stroke="rgba(13,81,75,.12)" stroke-width="1.2" />
      </pattern>
    </defs>

    <rect
      class="map-sketch-viewport__hit"
      role="button"
      tabindex="0"
      width={viewportSize.width}
      height={viewportSize.height}
      fill={display.grid ? 'url(#sketch-grid-large)' : 'transparent'}
      onpointerdown={(event) => {
        startMeasure(event)
        startPan(event)
      }}
      onclick={() => activeCommand === 'select' && onScopeChange('project')}
      onkeydown={(event) => activateOnKey(event, () => activeCommand === 'select' && onScopeChange('project'))}
    />

    {#if display.areas}
      {#each entities.filter((entity) => entity.kind === 'functionalArea') as entity}
        {@const rect = entityScreenRect(entity)}
        <g
          class="map-sketch-entity map-sketch-entity--area"
          role="button"
          tabindex="0"
          class:selected={selectedScope === entity.scopeId}
          onpointerenter={() => onScopeHover(entity.scopeId as MapStudioScopeId)}
          onpointerleave={() => onScopeHover(undefined)}
          onclick={(event) => {
            event.stopPropagation()
            onScopeChange(entity.scopeId as MapStudioScopeId)
          }}
          onkeydown={(event) => activateOnKey(event, () => onScopeChange(entity.scopeId as MapStudioScopeId))}
        >
          <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx="10" />
          <text x={rect.x + 12} y={rect.y + 23}>{entity.label}</text>
        </g>
      {/each}
    {/if}

    <g class="map-sketch-perimeter" class:selected={selectedScope === 'perimeter'}>
      <rect
        role="button"
        tabindex="0"
        x={perimeter.x}
        y={perimeter.y}
        width={perimeter.width}
        height={perimeter.height}
        rx="12"
        onclick={(event) => {
          event.stopPropagation()
          onScopeChange('perimeter')
        }}
        onkeydown={(event) => activateOnKey(event, () => onScopeChange('perimeter'))}
        onpointerenter={() => onScopeHover('perimeter')}
        onpointerleave={() => onScopeHover(undefined)}
      />
      <rect
        class="map-sketch-perimeter__usable"
        x={perimeter.x + projectModel.perimeter.marginsM.left * viewport.scale}
        y={perimeter.y + projectModel.perimeter.marginsM.top * viewport.scale}
        width={Math.max(0, (projectModel.perimeter.widthM - projectModel.perimeter.marginsM.left - projectModel.perimeter.marginsM.right) * viewport.scale)}
        height={Math.max(0, (projectModel.perimeter.depthM - projectModel.perimeter.marginsM.top - projectModel.perimeter.marginsM.bottom) * viewport.scale)}
        rx="8"
      />
    </g>

    {#if display.guides}
      <g class="map-sketch-sea-edge" aria-label="Lato mare">
        {#each ['top', 'right', 'bottom', 'left'] as side}
          {@const isActive = projectModel.perimeter.seaSide === side}
          <line
            role="button"
            tabindex="0"
            class:active={isActive}
            x1={side === 'right' ? perimeter.x + perimeter.width : perimeter.x}
            y1={side === 'bottom' ? perimeter.y + perimeter.height : perimeter.y}
            x2={side === 'left' ? perimeter.x : perimeter.x + perimeter.width}
            y2={side === 'top' ? perimeter.y : perimeter.y + perimeter.height}
            onclick={(event) => {
              event.stopPropagation()
              onSeaSideChange(side as SeaSide)
            }}
            onkeydown={(event) => activateOnKey(event, () => onSeaSideChange(side as SeaSide))}
          />
        {/each}
      </g>
    {/if}

    {#if display.tracks}
      {#each entities.filter((entity) => entity.kind === 'track') as entity}
        {@const rect = entityScreenRect(entity)}
        <g
          class="map-sketch-entity map-sketch-entity--track"
          role="button"
          tabindex="0"
          class:selected={selectedScope === entity.scopeId}
          onpointerenter={() => onScopeHover(entity.scopeId as MapStudioScopeId)}
          onpointerleave={() => onScopeHover(undefined)}
          onclick={(event) => {
            event.stopPropagation()
            onScopeChange(entity.scopeId as MapStudioScopeId)
          }}
          onkeydown={(event) => activateOnKey(event, () => onScopeChange(entity.scopeId as MapStudioScopeId))}
        >
          <line x1={rect.x} x2={rect.x + rect.width} y1={rect.y} y2={rect.y} stroke={trackColor(entity.objectType)} />
          <text x={rect.x + 6} y={rect.y - 8}>{entity.label}</text>
        </g>
        {#if display.footprints}
          {#each drawEntityFootprints(entity) as item}
            {@const center = worldToScreen({ x: item.cx, y: item.cy }, viewport)}
            <g class="map-sketch-footprint">
              <circle class="clearance" cx={center.x} cy={center.y} r={Math.max(3, item.clearance * viewport.scale)} stroke={item.color} />
              <circle cx={center.x} cy={center.y} r={Math.max(3, item.r * viewport.scale)} fill={item.color} />
            </g>
          {/each}
        {/if}
      {/each}
    {/if}

    {#if display.dimensions}
      <g class="map-sketch-dimensions">
        <line x1={perimeter.x} x2={perimeter.x + perimeter.width} y1={perimeter.y - 28} y2={perimeter.y - 28} />
        <text x={perimeter.x + perimeter.width / 2} y={perimeter.y - 36}>{formatMeters(projectModel.perimeter.widthM)}</text>
        <line x1={perimeter.x - 28} x2={perimeter.x - 28} y1={perimeter.y} y2={perimeter.y + perimeter.height} />
        <text x={perimeter.x - 42} y={perimeter.y + perimeter.height / 2}>{formatMeters(projectModel.perimeter.depthM)}</text>
      </g>
    {/if}

    {#if activeCommand === 'perimeter' || activeCommand === 'margin' || selectedScope === 'perimeter'}
      <g class="map-sketch-handles" aria-label="Handle perimetro">
        <rect
          role="slider"
          tabindex="0"
          aria-valuemin="4"
          aria-valuemax="90"
          aria-valuenow={projectModel.perimeter.widthM}
          x={perimeter.x + perimeter.width - 7}
          y={perimeter.y + perimeter.height / 2 - 18}
          width="14"
          height="36"
          rx="5"
          onpointerdown={(event) => startPerimeterDrag(event, 'width')}
        />
        <rect
          role="slider"
          tabindex="0"
          aria-valuemin="4"
          aria-valuemax="90"
          aria-valuenow={projectModel.perimeter.depthM}
          x={perimeter.x + perimeter.width / 2 - 18}
          y={perimeter.y + perimeter.height - 7}
          width="36"
          height="14"
          rx="5"
          onpointerdown={(event) => startPerimeterDrag(event, 'depth')}
        />
        <circle
          role="slider"
          tabindex="0"
          aria-valuemin="4"
          aria-valuemax="90"
          aria-valuenow={projectModel.perimeter.widthM}
          cx={perimeter.x + perimeter.width}
          cy={perimeter.y + perimeter.height}
          r="9"
          onpointerdown={(event) => startPerimeterDrag(event, 'width')}
        />
        <rect
          role="slider"
          tabindex="0"
          aria-valuemin="0"
          aria-valuemax={projectModel.perimeter.depthM}
          aria-valuenow={projectModel.perimeter.marginsM.top}
          x={perimeter.x + 18}
          y={perimeter.y + projectModel.perimeter.marginsM.top * viewport.scale - 5}
          width={Math.max(20, perimeter.width - 36)}
          height="10"
          rx="5"
          class="margin"
          onpointerdown={(event) => startPerimeterDrag(event, 'marginTop')}
        />
      </g>
    {/if}

    {#if measurement}
      {@const start = worldToScreen(measurement.start, viewport)}
      {@const end = worldToScreen(measurement.end, viewport)}
      <g class="map-sketch-measurement">
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
        <circle cx={start.x} cy={start.y} r="5" />
        <circle cx={end.x} cy={end.y} r="5" />
        <rect x={(start.x + end.x) / 2 - 34} y={(start.y + end.y) / 2 - 25} width="68" height="22" rx="11" />
        <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 10}>{formatMeters(measurement.valueM, 2)}</text>
      </g>
    {/if}
  </svg>
</div>
