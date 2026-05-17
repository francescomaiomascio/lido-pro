<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioProjectState } from '../../MapStudioProjectState'
  import type { MapStudioSelectedHandle } from '../../state/mapStudioManipulation'
  import type { MapStudioScopeId } from '../../state/mapStudioScope'
  import { roundMeters, svgPointFromEvent } from './overlayPointer'

  let {
    vm,
    projectState,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
  }: {
    vm: MetricBoardViewModel
    projectState: MapStudioProjectState
    onManipulationStart: (handle: MapStudioSelectedHandle, previewOnly?: boolean) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
  } = $props()

  let startPoint = $state<{ x: number; y: number } | null>(null)
  let livePoint = $state<{ x: number; y: number } | null>(null)

  const measurementHandle = (nextPoint: { x: number; y: number }): MapStudioSelectedHandle | null => {
    if (!startPoint) return null
    const distance = Math.hypot(nextPoint.x - startPoint.x, nextPoint.y - startPoint.y) / vm.frame.scale
    return {
      kind: 'measurement-distance',
      id: 'free-measure',
      label: 'Misura libera',
      targetScope: 'project' as MapStudioScopeId,
      tool: 'measure',
      manipulation: 'measureDistance',
      affectedParameter: 'measurement.distanceM',
      currentValue: 0,
      proposedValue: roundMeters(distance),
      unit: 'm',
    }
  }

  const pointerDown = (event: PointerEvent) => {
    if (projectState.activeTool !== 'measure') return
    event.stopPropagation()
    const target = event.currentTarget as SVGRectElement
    target.setPointerCapture(event.pointerId)
    startPoint = svgPointFromEvent(event)
    livePoint = startPoint
    const handle = measurementHandle(startPoint)
    if (handle) onManipulationStart(handle, true)
  }

  const pointerMove = (event: PointerEvent) => {
    if (!startPoint || projectState.activeTool !== 'measure') return
    livePoint = svgPointFromEvent(event)
    const handle = measurementHandle(livePoint)
    if (handle) onManipulationUpdate(handle)
  }

  const pointerUp = () => {
    if (!startPoint) return
    onManipulationFinish()
    startPoint = null
  }
</script>

{#if projectState.activeTool === 'measure'}
  <g class="parametric-board__measurement-overlay">
    <rect
      class="parametric-board__measure-hit"
      x={vm.frame.frameX}
      y={vm.frame.frameY}
      width={vm.frame.frameW}
      height={vm.frame.frameH}
      role="button"
      tabindex="0"
      aria-label="Misura distanza sulla tavola"
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
    />
    {#if startPoint && livePoint}
      <line x1={startPoint.x} y1={startPoint.y} x2={livePoint.x} y2={livePoint.y} />
      <circle cx={startPoint.x} cy={startPoint.y} r="5" />
      <circle cx={livePoint.x} cy={livePoint.y} r="5" />
      <g transform={`translate(${(startPoint.x + livePoint.x) / 2}, ${(startPoint.y + livePoint.y) / 2 - 10})`}>
        <rect x="-30" y="-11" width="60" height="22" rx="11" />
        <text y="4">{projectState.selectedHandle?.proposedValue.toFixed(2).replace('.', ',') ?? '0,00'}m</text>
      </g>
    {/if}
  </g>
{/if}
