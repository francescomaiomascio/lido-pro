<script lang="ts">
  import type { MetricBoardViewModel } from '../metricBoardViewModel'
  import type { MapStudioLayerId } from '../../mapStudioLayers'

  let {
    vm,
    activeLayers,
    technicalMode = false,
  }: {
    vm: MetricBoardViewModel
    activeLayers: MapStudioLayerId[]
    technicalMode?: boolean
  } = $props()
  const sandActive = $derived(activeLayers.includes('sand.surface') || activeLayers.includes('base.surface'))
  const seaActive = $derived(activeLayers.includes('sea.edge') && !technicalMode)
</script>

<g class="parametric-board__surface" class:is-muted={!sandActive && !seaActive} class:is-technical={technicalMode} filter="url(#board-shadow)">
  <rect x={vm.frame.frameX} y={vm.frame.frameY} width={vm.frame.frameW} height={vm.frame.frameH} rx="22" fill={technicalMode ? 'rgb(245 250 246 / 88%)' : 'url(#board-sand)'} />
  {#if !technicalMode}
    <rect x={vm.frame.frameX} y={vm.frame.frameY} width={vm.frame.frameW} height={vm.frame.frameH} rx="22" fill="url(#board-grain)" opacity={sandActive ? ".8" : ".42"} />
    <rect x={vm.frame.frameX} y={vm.frame.frameY} width={vm.frame.frameW} height={vm.frame.frameH} rx="22" fill="url(#board-sand-vignette)" />
    <rect class:is-strong={seaActive} x={vm.frame.frameX} y={vm.frame.frameY} width={vm.frame.frameW} height={vm.frame.seaH} rx="22" fill="url(#board-sea)" />
    <path
      class="parametric-board__shore"
      class:is-strong={seaActive}
      d={`M ${vm.frame.frameX + 14} ${vm.frame.frameY + vm.frame.seaH - 12} C ${vm.frame.frameX + vm.frame.frameW * .22} ${vm.frame.frameY + vm.frame.seaH + 9}, ${vm.frame.frameW * .48 + vm.frame.frameX} ${vm.frame.frameY + vm.frame.seaH - 24}, ${vm.frame.frameX + vm.frame.frameW * .72} ${vm.frame.frameY + vm.frame.seaH - 3} S ${vm.frame.frameX + vm.frame.frameW - 14} ${vm.frame.frameY + vm.frame.seaH - 8}`}
      fill="none"
    />
  {/if}
  <rect x={vm.frame.frameX} y={vm.frame.frameY} width={vm.frame.frameW} height={vm.frame.frameH} rx="22" fill="url(#board-grid)" opacity={technicalMode ? ".92" : sandActive ? ".72" : ".25"} />
</g>
