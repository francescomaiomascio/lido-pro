<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'

  let { vm, active }: { vm: MetricBoardViewModel; active: boolean } = $props()
</script>

<g class="parametric-board__warnings" class:is-muted={!active}>
  {#each vm.warnings as warning}
    <g transform={`translate(${warning.x}, ${warning.y})`}>
      <circle r="11" />
      <text y="4">!</text>
      <title>{warning.label}</title>
    </g>
  {/each}
</g>
