<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'

  let {
    vm,
    active,
    selectedAreaId = undefined,
    selectedTrackId = undefined,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    selectedAreaId?: string
    selectedTrackId?: string
  } = $props()

  const selectedArea = $derived(selectedAreaId ? vm.areas.find((area) => area.zone.id === selectedAreaId) : undefined)
  const selectedTrack = $derived(selectedTrackId ? vm.tracks.find((track) => track.row.id === selectedTrackId) : undefined)
</script>

<g class="parametric-board__selection" class:is-muted={!active}>
  {#if selectedArea}
    <rect x={selectedArea.x - 4} y={selectedArea.y - 4} width={selectedArea.w + 8} height={selectedArea.h + 8} rx="22" />
  {/if}
  {#if selectedTrack}
    <line x1={selectedTrack.x1} x2={selectedTrack.x2} y1={selectedTrack.y} y2={selectedTrack.y} />
  {/if}
</g>
