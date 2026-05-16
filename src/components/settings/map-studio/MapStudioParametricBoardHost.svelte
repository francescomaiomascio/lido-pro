<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import MapStudioLayerBar from './MapStudioLayerBar.svelte'
  import ParametricBoard from './board/ParametricBoard.svelte'
  import type { MapStudioLayerId } from './mapStudioLayers'

  let {
    setup,
    output = null,
    projectState,
    disabledLayers = [],
    onLayerToggle,
    onSelectedZoneChange,
    onSelectedRowChange,
    onSelectedItemChange,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    disabledLayers?: MapStudioLayerId[]
    onLayerToggle: (layer: MapStudioLayerId) => void
    onSelectedZoneChange: (id: string) => void
    onSelectedRowChange: (id: string) => void
    onSelectedItemChange: (code: string) => void
  } = $props()
</script>

<section class="map-studio-board-host" aria-label="Tavola parametrica">
  <MapStudioLayerBar activeLayerSet={projectState.activeLayerSet} {disabledLayers} {onLayerToggle} />
  <div class="map-studio-board-host__stage">
    <ParametricBoard
      {setup}
      {output}
      {projectState}
      {onSelectedZoneChange}
      {onSelectedRowChange}
      {onSelectedItemChange}
    />
  </div>
</section>
