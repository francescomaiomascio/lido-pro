<script lang="ts">
  import { boardAssetSymbol, boardFamilyClass } from '../metricBoardAssets'
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioBoardEmphasisModel } from '../../state/mapStudioSelectors'
  import type { MapStudioScopeId } from '../../state/mapStudioScope'

  let {
    vm,
    active,
    footprintsActive,
    emphasis,
    onScopeChange,
    onScopeHover,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    footprintsActive: boolean
    emphasis: MapStudioBoardEmphasisModel
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
  } = $props()
</script>

<g class="parametric-board__objects" class:is-muted={!active}>
  {#each vm.objects as object}
    {@const scopeId = `object:${object.code}` as MapStudioScopeId}
    {@const selected = emphasis.selectedEntity?.kind === 'object' && emphasis.selectedEntity.id === object.code}
    {@const emphasized = emphasis.emphasizedItemCodes.includes(object.code) || emphasis.emphasizedObjectTypeIds.includes(object.family)}
    {@const hovered = emphasis.hoveredEntity?.kind === 'object' && emphasis.hoveredEntity.id === object.code}
    {@const scoped = !emphasis.mutedItemCodes.includes(object.code)}
    <g
      class={`parametric-board__object ${boardFamilyClass(object.family)}`}
      class:is-selected={selected}
      class:is-emphasized={emphasized}
      class:is-hovered={hovered}
      class:is-outscope={!scoped}
      class:is-footprint={footprintsActive}
      transform={`translate(${object.x}, ${object.y})`}
      role="button"
      tabindex="0"
      onmouseenter={() => onScopeHover(scopeId)}
      onmouseleave={() => onScopeHover()}
      onfocus={() => onScopeHover(scopeId)}
      onblur={() => onScopeHover()}
      onkeydown={(event) => event.key === 'Enter' && onScopeChange(scopeId)}
      onclick={(event) => {
        event.stopPropagation()
        onScopeChange(scopeId)
      }}
    >
      {#if footprintsActive && scoped}
        <circle class="parametric-board__footprint" r={object.footprintRadius} />
      {/if}
      <circle class="parametric-board__focus-ring" r={object.radius + 5} />
      <use href={boardAssetSymbol(object.family)} x={-object.radius} y={-object.radius} width={object.radius * 2} height={object.radius * 2} filter="url(#board-object-shadow)" />
      <circle class="parametric-board__object-hit" r={Math.max(16, object.radius + 7)} />
    </g>
  {/each}
</g>
