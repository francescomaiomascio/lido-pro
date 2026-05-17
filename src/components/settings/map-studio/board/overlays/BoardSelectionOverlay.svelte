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

{#if projectState.selectedEntity}
  <g class="parametric-board__selection-overlay">
    <g transform={`translate(${vm.frame.frameX + vm.frame.frameW - 220}, ${vm.frame.frameY + 18})`}>
      <rect x="0" y="0" width="202" height="36" rx="18" />
      <text x="14" y="22">{projectState.selectedEntity.label}</text>
    </g>
  </g>
{/if}
