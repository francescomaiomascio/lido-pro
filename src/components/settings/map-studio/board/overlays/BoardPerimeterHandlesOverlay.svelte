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

  let activeHandle = $state<'width' | 'height' | 'marginTop' | null>(null)

  const handleFromPoint = (kind: 'width' | 'height' | 'marginTop', event: PointerEvent): MapStudioSelectedHandle => {
    const point = svgPointFromEvent(event)
    const currentValue =
      kind === 'width'
        ? vm.frame.frameW / vm.frame.scale
        : kind === 'height'
          ? vm.frame.frameH / vm.frame.scale
          : 0.5
    const proposedValue =
      kind === 'width'
        ? clamp((point.x - vm.frame.frameX) / vm.frame.scale, 8, 80)
        : kind === 'height'
          ? clamp((point.y - vm.frame.frameY) / vm.frame.scale, 8, 80)
          : clamp((point.y - vm.frame.frameY) / vm.frame.scale, 0, 5)
    return {
      kind: kind === 'marginTop' ? 'margin-guide' : 'perimeter-side',
      id: `perimeter-${kind}`,
      label: kind === 'width' ? 'Larghezza spiaggia' : kind === 'height' ? 'Profondita spiaggia' : 'Margine lato mare',
      targetScope: 'perimeter' as MapStudioScopeId,
      tool: 'perimeterEdit',
      manipulation: 'dragHandle',
      affectedParameter: kind === 'width' ? 'beach.widthM' : kind === 'height' ? 'beach.depthM' : 'beach.marginsM.top',
      currentValue: roundMeters(currentValue),
      proposedValue: roundMeters(proposedValue),
      unit: 'm',
    }
  }

  const pointerDown = (kind: 'width' | 'height' | 'marginTop', event: PointerEvent) => {
    event.stopPropagation()
    ;(event.currentTarget as SVGGraphicsElement).setPointerCapture(event.pointerId)
    activeHandle = kind
    onScopeChange('perimeter')
    onManipulationStart(handleFromPoint(kind, event))
  }

  const pointerMove = (event: PointerEvent) => {
    if (!activeHandle) return
    onManipulationUpdate(handleFromPoint(activeHandle, event))
  }

  const pointerUp = () => {
    if (!activeHandle) return
    activeHandle = null
    onManipulationFinish()
  }
</script>

{#if projectState.activeTool === 'perimeterEdit'}
  <g class="parametric-board__manipulator-overlay parametric-board__perimeter-handles">
    <rect
      x={vm.frame.frameX}
      y={vm.frame.frameY}
      width={vm.frame.frameW}
      height={vm.frame.frameH}
      rx="22"
    />
    <line class="guide" x1={vm.frame.frameX} x2={vm.frame.frameX + vm.frame.frameW} y1={vm.frame.frameY + vm.frame.scale * 0.5} y2={vm.frame.frameY + vm.frame.scale * 0.5} />
    <circle
      class="handle"
      cx={vm.frame.frameX + vm.frame.frameW}
      cy={vm.frame.frameY + vm.frame.frameH / 2}
      r="8"
      role="button"
      tabindex="0"
      aria-label="Regola larghezza perimetro"
      onpointerdown={(event) => pointerDown('width', event)}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
    />
    <circle
      class="handle"
      cx={vm.frame.frameX + vm.frame.frameW / 2}
      cy={vm.frame.frameY + vm.frame.frameH}
      r="8"
      role="button"
      tabindex="0"
      aria-label="Regola profondita perimetro"
      onpointerdown={(event) => pointerDown('height', event)}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
    />
    <rect
      class="handle handle--rect"
      x={vm.frame.frameX + vm.frame.frameW / 2 - 24}
      y={vm.frame.frameY + vm.frame.scale * 0.5 - 6}
      width="48"
      height="12"
      rx="6"
      role="button"
      tabindex="0"
      aria-label="Regola margine lato mare"
      onpointerdown={(event) => pointerDown('marginTop', event)}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
    />
  </g>
{/if}
