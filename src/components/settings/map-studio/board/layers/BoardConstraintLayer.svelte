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

<g class="parametric-board__constraints" class:is-muted={!active}>
  {#each vm.constraints as constraint}
    {@const scopeId = `constraint:${constraint.id}` as MapStudioScopeId}
    {@const selected = emphasis.selectedEntity?.kind === 'constraint' && emphasis.selectedEntity.id === constraint.id}
    {@const emphasized = emphasis.emphasizedConstraintIds.includes(constraint.id)}
    {@const hovered = emphasis.hoveredEntity?.kind === 'constraint' && emphasis.hoveredEntity.id === constraint.id}
    <g
      class:is-invalid={constraint.invalid}
      class:is-selected={selected}
      class:is-emphasized={emphasized}
      class:is-hovered={hovered}
      role="button"
      tabindex="0"
      onmouseenter={() => onScopeHover(scopeId)}
      onmouseleave={() => onScopeHover()}
      onfocus={() => onScopeHover(scopeId)}
      onblur={() => onScopeHover()}
      onkeydown={(event) => event.key === 'Enter' && onScopeChange(scopeId)}
      onclick={() => onScopeChange(scopeId)}
    >
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
