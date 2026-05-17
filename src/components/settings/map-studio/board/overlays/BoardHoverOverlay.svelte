<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioProjectState } from '../../MapStudioProjectState'

  let {
    vm,
    projectState,
  }: {
    vm: MetricBoardViewModel
    projectState: MapStudioProjectState
  } = $props()
</script>

{#if projectState.hoveredEntity}
  <g class="parametric-board__hover-overlay">
    <g transform={`translate(${vm.frame.frameX + 18}, ${vm.frame.frameY + vm.frame.frameH - 18})`}>
      <rect x="0" y="-24" width={Math.max(132, projectState.hoveredEntity.label.length * 7 + 38)} height="28" rx="14" />
      <text x="14" y="-6">{projectState.hoveredEntity.label}</text>
    </g>
  </g>
{/if}
