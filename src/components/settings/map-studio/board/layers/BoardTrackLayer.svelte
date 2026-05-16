<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'

  let {
    vm,
    active,
    selectedTrackId = undefined,
    selectedAreaId = undefined,
    onSelectedRowChange,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    selectedTrackId?: string
    selectedAreaId?: string
    onSelectedRowChange: (id: string) => void
  } = $props()

  const color = (family: string) =>
    family === 'umbrella' ? '#b87a27' : family === 'small_palm' ? '#2f7654' : '#11775b'
</script>

<g class="parametric-board__tracks" class:is-muted={!active}>
  {#each vm.tracks as track}
    {@const selected = selectedTrackId === track.row.id}
    {@const outscope = Boolean((selectedTrackId && !selected) || (selectedAreaId && track.row.zoneId !== selectedAreaId))}
    <g
      class="parametric-board__track"
      class:is-selected={selected}
      class:is-outscope={outscope}
      role="button"
      tabindex="0"
      onkeydown={(event) => event.key === 'Enter' && onSelectedRowChange(track.row.id)}
      onclick={() => onSelectedRowChange(track.row.id)}
    >
      <line x1={track.x1} x2={track.x2} y1={track.y} y2={track.y} stroke={color(track.row.family)} />
      <line class="parametric-board__track-hit" x1={track.x1} x2={track.x2} y1={track.y} y2={track.y} />
    </g>
  {/each}
</g>
