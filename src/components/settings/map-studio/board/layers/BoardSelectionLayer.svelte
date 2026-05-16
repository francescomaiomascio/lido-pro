<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioBoardEmphasisModel } from '../../state/mapStudioSelectors'

  let {
    vm,
    active,
    emphasis,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    emphasis: MapStudioBoardEmphasisModel
  } = $props()

  const selectedArea = $derived(
    emphasis.selectedEntity?.relatedAreaIds[0]
      ? vm.areas.find((area) => area.zone.id === emphasis.selectedEntity?.relatedAreaIds[0])
      : undefined,
  )
  const selectedTrack = $derived(
    emphasis.selectedEntity?.relatedTrackIds[0]
      ? vm.tracks.find((track) => track.row.id === emphasis.selectedEntity?.relatedTrackIds[0])
      : undefined,
  )
</script>

<g class="parametric-board__selection" class:is-muted={!active}>
  {#if selectedArea}
    <rect x={selectedArea.x - 4} y={selectedArea.y - 4} width={selectedArea.w + 8} height={selectedArea.h + 8} rx="22" />
  {/if}
  {#if selectedTrack}
    <line x1={selectedTrack.x1} x2={selectedTrack.x2} y1={selectedTrack.y} y2={selectedTrack.y} />
  {/if}
</g>
