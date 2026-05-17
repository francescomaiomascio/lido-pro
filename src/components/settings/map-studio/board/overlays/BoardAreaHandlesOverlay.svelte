<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioProjectState } from '../../MapStudioProjectState'
  import type { MapStudioSelectedHandle } from '../../state/mapStudioManipulation'
  import type { MapStudioScopeId } from '../../state/mapStudioScope'
  import { clamp, roundMeters, svgPointFromEvent } from './overlayPointer'

  let {
    vm,
    projectState,
    onScopeChange,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
  }: {
    vm: MetricBoardViewModel
    projectState: MapStudioProjectState
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onManipulationStart: (handle: MapStudioSelectedHandle) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
  } = $props()

  let activeAreaId = $state<string | null>(null)

  const visibleAreas = $derived(vm.areas.filter((area) =>
    area.role !== 'sea' && (!projectState.selectedEntity?.relatedAreaIds.length || projectState.selectedEntity.relatedAreaIds.includes(area.zone.id)),
  ))

  const handleFromPoint = (area: (typeof vm.areas)[number], event: PointerEvent): MapStudioSelectedHandle => {
    const point = svgPointFromEvent(event)
    return {
      kind: 'area-boundary',
      id: `area-depth-${area.zone.id}`,
      label: `${area.label} · profondita`,
      targetScope: `area:${area.zone.id}` as MapStudioScopeId,
      tool: 'areaEdit',
      manipulation: 'resizeBand',
      affectedParameter: `zone.${area.zone.id}.heightM`,
      currentValue: roundMeters(area.zone.heightM),
      proposedValue: roundMeters(clamp((point.y - area.y) / vm.frame.scale, 0.5, 30)),
      unit: 'm',
    }
  }

  const pointerDown = (area: (typeof vm.areas)[number], event: PointerEvent) => {
    event.stopPropagation()
    ;(event.currentTarget as SVGGraphicsElement).setPointerCapture(event.pointerId)
    activeAreaId = area.zone.id
    onScopeChange(`area:${area.zone.id}` as MapStudioScopeId)
    onManipulationStart(handleFromPoint(area, event))
  }

  const pointerMove = (area: (typeof vm.areas)[number], event: PointerEvent) => {
    if (activeAreaId !== area.zone.id) return
    onManipulationUpdate(handleFromPoint(area, event))
  }

  const pointerUp = () => {
    if (!activeAreaId) return
    activeAreaId = null
    onManipulationFinish()
  }
</script>

{#if projectState.activeTool === 'areaEdit'}
  <g class="parametric-board__manipulator-overlay parametric-board__area-handles">
    {#each visibleAreas as area}
      <rect x={area.x} y={area.y} width={area.w} height={area.h} rx="18" />
      <line class="guide" x1={area.x + 12} x2={area.x + area.w - 12} y1={area.y + area.h} y2={area.y + area.h} />
      <rect
        class="handle"
        x={area.x + area.w / 2 - 34}
        y={area.y + area.h - 7}
        width="68"
        height="14"
        rx="7"
        role="button"
        tabindex="0"
        aria-label={`Regola profondita area ${area.label}`}
        onpointerdown={(event) => pointerDown(area, event)}
        onpointermove={(event) => pointerMove(area, event)}
        onpointerup={pointerUp}
      />
    {/each}
  </g>
{/if}
