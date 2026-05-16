<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'

  let {
    vm,
    active,
    selectedAreaId = undefined,
    onSelectedZoneChange,
  }: {
    vm: MetricBoardViewModel
    active: boolean
    selectedAreaId?: string
    onSelectedZoneChange: (id: string) => void
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
    {@const selected = selectedAreaId === area.zone.id}
    <g
      class="parametric-board__area"
      class:is-selected={selected}
      class:is-outscope={Boolean(selectedAreaId && !selected)}
      role="button"
      tabindex="0"
      onkeydown={(event) => event.key === 'Enter' && onSelectedZoneChange(area.zone.id)}
      onclick={() => onSelectedZoneChange(area.zone.id)}
    >
      <rect x={area.x} y={area.y} width={area.w} height={area.h} rx="18" fill={fillForRole(area.role)} />
      <path d={`M${area.x + 10} ${area.y + 10}H${area.x + area.w - 10}V${area.y + area.h - 10}H${area.x + 10}Z`} />
      <rect class="parametric-board__hit" x={area.x} y={area.y} width={area.w} height={area.h} rx="18" />
    </g>
  {/each}
</g>
