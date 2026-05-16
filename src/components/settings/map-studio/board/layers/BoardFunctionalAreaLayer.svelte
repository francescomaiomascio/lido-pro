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

  const fillForRole = (role: string) =>
    role === 'umbrella'
      ? 'url(#board-zone-umbrella)'
      : role === 'small_palm'
        ? 'url(#board-zone-palmetta)'
        : role === 'palm'
          ? 'url(#board-zone-palm)'
          : 'url(#board-zone-empty)'
</script>

<g class="parametric-board__areas" class:is-muted={!active}>
  {#each vm.areas.filter((area) => area.role !== 'sea') as area}
    {@const scopeId = `area:${area.zone.id}` as MapStudioScopeId}
    {@const selected = emphasis.selectedEntity?.kind === 'area' && emphasis.selectedEntity.id === area.zone.id}
    {@const emphasized = emphasis.emphasizedAreaIds.includes(area.zone.id)}
    {@const hovered = emphasis.hoveredEntity?.kind === 'area' && emphasis.hoveredEntity.id === area.zone.id}
    {@const outscope = emphasis.mutedAreaIds.includes(area.zone.id)}
    <g
      class="parametric-board__area"
      class:is-selected={selected}
      class:is-emphasized={emphasized}
      class:is-hovered={hovered}
      class:is-outscope={outscope}
      role="button"
      tabindex="0"
      onmouseenter={() => onScopeHover(scopeId)}
      onmouseleave={() => onScopeHover()}
      onfocus={() => onScopeHover(scopeId)}
      onblur={() => onScopeHover()}
      onkeydown={(event) => event.key === 'Enter' && onScopeChange(scopeId)}
      onclick={() => onScopeChange(scopeId)}
    >
      <rect x={area.x} y={area.y} width={area.w} height={area.h} rx="18" fill={fillForRole(area.role)} />
      <path d={`M${area.x + 10} ${area.y + 10}H${area.x + area.w - 10}V${area.y + area.h - 10}H${area.x + 10}Z`} />
      <rect class="parametric-board__hit" x={area.x} y={area.y} width={area.w} height={area.h} rx="18" />
    </g>
  {/each}
</g>
