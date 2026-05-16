<script lang="ts">
  import { boardAssetSymbol, boardFamilyClass } from '../metricBoardAssets'
  import type { MetricBoardViewModel } from '../metricBoardViewModel'

  let {
    vm,
    active,
    footprintsActive,
    selectedAreaId = undefined,
    selectedTrackId = undefined,
    selectedObjectCode = undefined,
    onSelectedItemChange,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    footprintsActive: boolean
    selectedAreaId?: string
    selectedTrackId?: string
    selectedObjectCode?: string
    onSelectedItemChange: (code: string) => void
  } = $props()
</script>

<g class="parametric-board__objects" class:is-muted={!active}>
  {#each vm.objects as object}
    {@const selected = selectedObjectCode === object.code}
    {@const scoped = (!selectedAreaId || object.zoneId === selectedAreaId) && (!selectedTrackId || object.rowId === selectedTrackId)}
    <g
      class={`parametric-board__object ${boardFamilyClass(object.family)}`}
      class:is-selected={selected}
      class:is-outscope={!scoped}
      class:is-footprint={footprintsActive}
      transform={`translate(${object.x}, ${object.y})`}
      role="button"
      tabindex="0"
      onkeydown={(event) => event.key === 'Enter' && onSelectedItemChange(object.code)}
      onclick={(event) => {
        event.stopPropagation()
        onSelectedItemChange(object.code)
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
