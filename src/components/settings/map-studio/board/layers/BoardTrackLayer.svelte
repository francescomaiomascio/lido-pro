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

  const color = (family: string) =>
    family === 'umbrella' ? '#b87a27' : family === 'small_palm' ? '#2f7654' : '#11775b'
</script>

<g class="parametric-board__tracks" class:is-muted={!active}>
  {#each vm.tracks as track}
    {@const scopeId = `track:${track.row.id}` as MapStudioScopeId}
    {@const selected = emphasis.selectedEntity?.kind === 'track' && emphasis.selectedEntity.id === track.row.id}
    {@const emphasized = emphasis.emphasizedTrackIds.includes(track.row.id)}
    {@const hovered = emphasis.hoveredEntity?.kind === 'track' && emphasis.hoveredEntity.id === track.row.id}
    {@const outscope = emphasis.mutedTrackIds.includes(track.row.id)}
    <g
      class="parametric-board__track"
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
      <line x1={track.x1} x2={track.x2} y1={track.y} y2={track.y} stroke={color(track.row.family)} />
      <line class="parametric-board__track-hit" x1={track.x1} x2={track.x2} y1={track.y} y2={track.y} />
    </g>
  {/each}
</g>
