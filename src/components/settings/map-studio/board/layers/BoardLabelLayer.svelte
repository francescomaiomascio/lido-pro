<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioBoardEmphasisModel } from '../../state/mapStudioSelectors'

  let {
    vm,
    areaLabelsActive,
    trackLabelsActive,
    emphasis,
  }: {
    vm: MetricBoardViewModel
    areaLabelsActive: boolean
    trackLabelsActive: boolean
    emphasis: MapStudioBoardEmphasisModel
  } = $props()
</script>

<g class="parametric-board__labels">
  {#if areaLabelsActive}
    {#each vm.areas.filter((area) => area.role !== 'sea' && (area.w > 82 || emphasis.emphasizedAreaIds.includes(area.zone.id))) as area}
      <g class="parametric-board__area-label" class:is-selected={emphasis.emphasizedAreaIds.includes(area.zone.id)} transform={`translate(${area.x + 12}, ${area.y + Math.min(25, Math.max(18, area.h * .42))})`}>
        <rect x="0" y="-14" width={Math.min(126, Math.max(48, area.label.length * 7.6))} height="22" rx="11" />
        <text x="9" y="1">{area.label}</text>
      </g>
    {/each}
  {/if}
  {#if trackLabelsActive}
    {#each vm.tracks as track}
      <g class="parametric-board__track-label" class:is-selected={emphasis.emphasizedTrackIds.includes(track.row.id)} transform={`translate(${track.labelX}, ${track.labelY + 4})`}>
        <rect x="-4" y="-12" width={Math.max(25, track.row.label.length * 8 + 9)} height="18" rx="9" />
        <text x="4" y="1">{track.row.label}</text>
      </g>
    {/each}
  {/if}
</g>
