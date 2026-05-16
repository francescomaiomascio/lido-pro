<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioBoardEmphasisModel } from '../../state/mapStudioSelectors'

  let { vm, active, emphasis }: { vm: MetricBoardViewModel; active: boolean; emphasis: MapStudioBoardEmphasisModel } = $props()
  const ticksX = $derived(Array.from({ length: Math.floor(vm.frame.frameW / (vm.frame.scale * 5)) + 1 }, (_, index) => index * 5))
  const ticksY = $derived(Array.from({ length: Math.floor(vm.frame.frameH / (vm.frame.scale * 5)) + 1 }, (_, index) => index * 5))
  const selected = $derived(emphasis.selectedEntity?.kind === 'perimeter')
</script>

<g class="parametric-board__boundary" class:is-muted={!active} class:is-selected={selected}>
  <rect x={vm.frame.frameX} y={vm.frame.frameY} width={vm.frame.frameW} height={vm.frame.frameH} rx="22" />
  <path d={`M${vm.frame.frameX + 18} ${vm.frame.frameY}h-18v18M${vm.frame.frameX + vm.frame.frameW - 18} ${vm.frame.frameY}h18v18M${vm.frame.frameX} ${vm.frame.frameY + vm.frame.frameH - 18}v18h18M${vm.frame.frameX + vm.frame.frameW - 18} ${vm.frame.frameY + vm.frame.frameH}h18v-18`} />
  {#each ticksX as tick}
    <line x1={vm.x(tick)} x2={vm.x(tick)} y1={vm.frame.frameY - 7} y2={vm.frame.frameY} />
  {/each}
  {#each ticksY as tick}
    <line x1={vm.frame.frameX - 7} x2={vm.frame.frameX} y1={vm.y(tick)} y2={vm.y(tick)} />
  {/each}
  <text x={vm.frame.frameX + vm.frame.frameW - 78} y={vm.frame.frameY - 12}>31m × 28m</text>
</g>
