<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioProjectState } from '../../MapStudioProjectState'
  import { formatHandleValue } from '../../state/mapStudioManipulation'

  let {
    vm,
    projectState,
  }: {
    vm: MetricBoardViewModel
    projectState: MapStudioProjectState
  } = $props()

  const handle = $derived(projectState.selectedHandle)
  const draftParameter = $derived(projectState.projectDraft.changedParameters.slice(-1)[0])
</script>

{#if handle || draftParameter}
  <g class="parametric-board__draft-ghost">
    <g transform={`translate(${vm.frame.frameX + vm.frame.frameW / 2 - 98}, ${vm.frame.frameY + 58})`}>
      <rect x="0" y="0" width="196" height="38" rx="19" />
      <text x="14" y="16">{handle?.label ?? draftParameter?.label}</text>
      <text x="14" y="30">
        {#if handle}
          {formatHandleValue(handle.currentValue, handle.unit)} -> {formatHandleValue(handle.proposedValue, handle.unit)}
        {:else if draftParameter}
          {formatHandleValue(draftParameter.currentValue, draftParameter.unit)} -> {formatHandleValue(draftParameter.proposedValue, draftParameter.unit)}
        {/if}
      </text>
    </g>
  </g>
{/if}
