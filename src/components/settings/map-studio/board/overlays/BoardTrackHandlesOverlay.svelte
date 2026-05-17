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

  let activeTrackId = $state<string | null>(null)
  const visibleTracks = $derived(vm.tracks.filter((track) =>
    !projectState.selectedEntity?.relatedTrackIds.length || projectState.selectedEntity.relatedTrackIds.includes(track.row.id),
  ))

  const handleFromPoint = (track: (typeof vm.tracks)[number], event: PointerEvent): MapStudioSelectedHandle => {
    const point = svgPointFromEvent(event)
    const currentY = (track.y - vm.frame.frameY) / vm.frame.scale
    return {
      kind: 'track-line',
      id: `track-y-${track.row.id}`,
      label: `${track.row.label} · posizione riga`,
      targetScope: `track:${track.row.id}` as MapStudioScopeId,
      tool: 'trackEdit',
      manipulation: 'moveTrack',
      affectedParameter: `row.${track.row.id}.yM`,
      currentValue: roundMeters(currentY),
      proposedValue: roundMeters(clamp((point.y - vm.frame.frameY) / vm.frame.scale, 0, vm.frame.frameH / vm.frame.scale)),
      unit: 'm',
    }
  }

  const pointerDown = (track: (typeof vm.tracks)[number], event: PointerEvent) => {
    event.stopPropagation()
    ;(event.currentTarget as SVGGraphicsElement).setPointerCapture(event.pointerId)
    activeTrackId = track.row.id
    onScopeChange(`track:${track.row.id}` as MapStudioScopeId)
    onManipulationStart(handleFromPoint(track, event))
  }

  const pointerMove = (track: (typeof vm.tracks)[number], event: PointerEvent) => {
    if (activeTrackId !== track.row.id) return
    onManipulationUpdate(handleFromPoint(track, event))
  }

  const pointerUp = () => {
    if (!activeTrackId) return
    activeTrackId = null
    onManipulationFinish()
  }
</script>

{#if projectState.activeTool === 'trackEdit'}
  <g class="parametric-board__manipulator-overlay parametric-board__track-handles">
    {#each visibleTracks as track}
      <line class="guide" x1={track.x1} x2={track.x2} y1={track.y} y2={track.y} />
      <circle
        class="handle"
        cx={track.labelX + 38}
        cy={track.y}
        r="8"
        role="button"
        tabindex="0"
        aria-label={`Muovi tracciato ${track.row.label}`}
        onpointerdown={(event) => pointerDown(track, event)}
        onpointermove={(event) => pointerMove(track, event)}
        onpointerup={pointerUp}
      />
      <text x={track.labelX + 52} y={track.y + 4}>{track.row.label}</text>
    {/each}
  </g>
{/if}
