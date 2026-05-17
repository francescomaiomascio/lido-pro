<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioProjectState } from '../../MapStudioProjectState'
  import type { MapStudioSelectedHandle } from '../../state/mapStudioManipulation'
  import type { MapStudioScopeId } from '../../state/mapStudioScope'
  import type { MapStudioObjectTypeId } from '../../state/mapStudioRelations'
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

  let activeFamily = $state<MapStudioObjectTypeId | null>(null)

  const families = $derived.by<MapStudioObjectTypeId[]>(() => {
    const selected = projectState.selectedEntity?.relatedObjectTypeIds.filter((family) =>
      family === 'palm' || family === 'umbrella' || family === 'small_palm',
    ) as MapStudioObjectTypeId[] | undefined
    return selected?.length ? selected : ['umbrella', 'palm', 'small_palm']
  })

  const handleObjects = $derived(families.flatMap((family) => vm.objects.filter((object) => object.family === family).slice(0, 1)))
  const scopedObjects = $derived(vm.objects.filter((object) => families.includes(object.family as MapStudioObjectTypeId)))

  const handleFromPoint = (object: (typeof vm.objects)[number], event: PointerEvent): MapStudioSelectedHandle => {
    const point = svgPointFromEvent(event)
    const diameter = (Math.hypot(point.x - object.x, point.y - object.y) * 2) / vm.frame.scale
    return {
      kind: 'footprint-radius',
      id: `footprint-${object.family}`,
      label: `${object.family === 'umbrella' ? 'Ombrellone' : object.family === 'small_palm' ? 'Palmetta' : 'Palma'} · footprint`,
      targetScope: `objectType:${object.family}` as MapStudioScopeId,
      tool: 'footprintEdit',
      manipulation: 'editFootprint',
      affectedParameter: `objectType.${object.family}.footprintMeters`,
      currentValue: roundMeters(Math.max(object.widthM, object.heightM)),
      proposedValue: roundMeters(clamp(diameter, 0.2, 6)),
      unit: 'm',
    }
  }

  const pointerDown = (object: (typeof vm.objects)[number], event: PointerEvent) => {
    event.stopPropagation()
    ;(event.currentTarget as SVGGraphicsElement).setPointerCapture(event.pointerId)
    activeFamily = object.family as MapStudioObjectTypeId
    onScopeChange(`objectType:${object.family}` as MapStudioScopeId)
    onManipulationStart(handleFromPoint(object, event))
  }

  const pointerMove = (object: (typeof vm.objects)[number], event: PointerEvent) => {
    if (activeFamily !== object.family) return
    onManipulationUpdate(handleFromPoint(object, event))
  }

  const pointerUp = () => {
    if (!activeFamily) return
    activeFamily = null
    onManipulationFinish()
  }
</script>

{#if projectState.activeTool === 'footprintEdit'}
  <g class="parametric-board__manipulator-overlay parametric-board__footprint-handles">
    {#each scopedObjects as object}
      <circle cx={object.x} cy={object.y} r={object.footprintRadius} />
      <circle class="clearance" cx={object.x} cy={object.y} r={object.footprintRadius + 10} />
    {/each}
    {#each handleObjects as object}
      <line class="guide" x1={object.x} y1={object.y} x2={object.x + object.footprintRadius} y2={object.y} />
      <circle
        class="handle"
        cx={object.x + object.footprintRadius}
        cy={object.y}
        r="8"
        role="button"
        tabindex="0"
        aria-label={`Regola footprint ${object.family}`}
        onpointerdown={(event) => pointerDown(object, event)}
        onpointermove={(event) => pointerMove(object, event)}
        onpointerup={pointerUp}
      />
    {/each}
  </g>
{/if}
