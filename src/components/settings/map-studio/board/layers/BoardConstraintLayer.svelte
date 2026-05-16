<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'

  let { vm, active }: { vm: MetricBoardViewModel; active: boolean } = $props()
</script>

<g class="parametric-board__constraints" class:is-muted={!active}>
  {#each vm.constraints as constraint}
    <g class:is-invalid={constraint.invalid}>
      <line x1={constraint.x1} y1={constraint.y1} x2={constraint.x2} y2={constraint.y2} />
      <circle cx={constraint.x1} cy={constraint.y1} r="3" />
      <circle cx={constraint.x2} cy={constraint.y2} r="3" />
      <g transform={`translate(${(constraint.x1 + constraint.x2) / 2}, ${constraint.y1 - 8})`}>
        <rect x="-18" y="-10" width="36" height="18" rx="9" />
        <text y="3">{constraint.label}</text>
      </g>
    </g>
  {/each}
</g>
