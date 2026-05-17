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

  let activeConstraintId = $state<string | null>(null)
  const visibleConstraints = $derived(vm.constraints.filter((constraint) =>
    !projectState.selectedEntity?.relatedConstraintIds.length || projectState.selectedEntity.relatedConstraintIds.includes(constraint.id),
  ))

  const numberFromLabel = (label: string) => Number(label.replace(',', '.').replace(/[^\d.]/g, '')) || 0

  const handleFromPoint = (constraint: (typeof vm.constraints)[number], event: PointerEvent): MapStudioSelectedHandle => {
    const point = svgPointFromEvent(event)
    const distance = Math.hypot(point.x - constraint.x1, point.y - constraint.y1) / vm.frame.scale
    return {
      kind: 'constraint-distance',
      id: `constraint-handle-${constraint.id}`,
      label: `${constraint.label} · distanza`,
      targetScope: `constraint:${constraint.id}` as MapStudioScopeId,
      tool: 'constraintEdit',
      manipulation: 'adjustSpacing',
      affectedParameter: constraint.id,
      currentValue: roundMeters(numberFromLabel(constraint.label)),
      proposedValue: roundMeters(clamp(distance, 0.2, 12)),
      unit: 'm',
    }
  }

  const pointerDown = (constraint: (typeof vm.constraints)[number], event: PointerEvent) => {
    event.stopPropagation()
    ;(event.currentTarget as SVGGraphicsElement).setPointerCapture(event.pointerId)
    activeConstraintId = constraint.id
    onScopeChange(`constraint:${constraint.id}` as MapStudioScopeId)
    onManipulationStart(handleFromPoint(constraint, event))
  }

  const pointerMove = (constraint: (typeof vm.constraints)[number], event: PointerEvent) => {
    if (activeConstraintId !== constraint.id) return
    onManipulationUpdate(handleFromPoint(constraint, event))
  }

  const pointerUp = () => {
    if (!activeConstraintId) return
    activeConstraintId = null
    onManipulationFinish()
  }
</script>

{#if projectState.activeTool === 'constraintEdit'}
  <g class="parametric-board__manipulator-overlay parametric-board__constraint-handles">
    {#each visibleConstraints as constraint}
      <line class="guide" x1={constraint.x1} y1={constraint.y1} x2={constraint.x2} y2={constraint.y2} />
      <circle class="endpoint" cx={constraint.x1} cy={constraint.y1} r="4" />
      <circle
        class="handle"
        cx={constraint.x2}
        cy={constraint.y2}
        r="8"
        role="button"
        tabindex="0"
        aria-label={`Regola vincolo ${constraint.label}`}
        onpointerdown={(event) => pointerDown(constraint, event)}
        onpointermove={(event) => pointerMove(constraint, event)}
        onpointerup={pointerUp}
      />
      <g transform={`translate(${(constraint.x1 + constraint.x2) / 2}, ${constraint.y1 - 26})`}>
        <rect x="-34" y="-12" width="68" height="24" rx="12" />
        <text y="4">{constraint.label}</text>
      </g>
    {/each}
  </g>
{/if}
