<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioBoardEmphasisModel } from '../../state/mapStudioSelectors'
  import type { MapStudioScopeId } from '../../state/mapStudioScope'

  let {
    vm,
    active,
    emphasis,
    onScopeChange,
    onScopeHover,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    emphasis: MapStudioBoardEmphasisModel
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
  } = $props()
</script>

<g class="parametric-board__warnings" class:is-muted={!active}>
  {#each vm.warnings.filter((warning) => !emphasis.visibleWarningIds.length || emphasis.visibleWarningIds.includes(warning.id)) as warning}
    {@const scopeId = `warning:${warning.id}` as MapStudioScopeId}
    {@const selected = emphasis.selectedEntity?.kind === 'warning' && emphasis.selectedEntity.id === warning.id}
    {@const hovered = emphasis.hoveredEntity?.kind === 'warning' && emphasis.hoveredEntity.id === warning.id}
    <g
      class:is-selected={selected}
      class:is-hovered={hovered}
      transform={`translate(${warning.x}, ${warning.y})`}
      role="button"
      tabindex="0"
      onmouseenter={() => onScopeHover(scopeId)}
      onmouseleave={() => onScopeHover()}
      onfocus={() => onScopeHover(scopeId)}
      onblur={() => onScopeHover()}
      onkeydown={(event) => event.key === 'Enter' && onScopeChange(scopeId)}
      onclick={() => onScopeChange(scopeId)}
    >
      <circle r="11" />
      <text y="4">!</text>
      <title>{warning.label}</title>
    </g>
  {/each}
</g>
